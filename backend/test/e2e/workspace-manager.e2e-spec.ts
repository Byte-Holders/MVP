import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';

// Mock per la libreria JWT (come fatto in precedenza)
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: () => {
    return (req: any, header: any, payload: any, cb: any) => {
      if (cb) {
        cb(null, 'chiave-segreta-finta');
      }
    };
  },
}));

import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('WorkspaceManagerController (e2e)', () => {
  let app: INestApplication;
  let workspaceModel: any;
  let workspaceAppenaCreatoId: string; // Lo salviamo durante la POST per cancellarlo nella DELETE

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      // ATTENZIONE QUI: Oltre a far passare la richiesta, iniettiamo un finto @User()
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: 'utente-manager-e2e', username: 'test-manager' };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    workspaceModel = app.get(getModelToken('Workspace'));
  });

  afterAll(async () => {
    // Pulizia finale: cancelliamo eventuali workspace rimasti orfani dal test
    await workspaceModel.deleteMany({ ownerId: 'utente-manager-e2e' });
    if (app) {
      await app.close();
    }
  });

  // --- I TEST HTTP ---

  describe('POST /workspaces', () => {
    it('dovrebbe creare un nuovo workspace e restituire 201', () => {
      return request(app.getHttpServer() as any)
        .post('/api/workspaces')
        .send({
          // Il DTO richiede solo il nome, ownerId e username li prende dal nostro mock @User()!
          name: `Workspace Main E2E ${Date.now()}`,
        })
        .expect(201)
        .then((response) => {
          // Il server ci risponde col DTO. Salviamo l'ID appena generato
          // Nota: adatta 'id' in base a come il tuo DTO mappa l'ID (potrebbe essere '_id')
          workspaceAppenaCreatoId = response.body.id || response.body._id;
          expect(workspaceAppenaCreatoId).toBeDefined();
        });
    });
  });

  describe('GET /workspaces', () => {
    it("dovrebbe restituire la lista dei workspace dell'utente", () => {
      return request(app.getHttpServer() as any)
        .get('/api/workspaces')
        .expect(200)
        .then((response) => {
          // Verifichiamo che risponda con un array
          expect(Array.isArray(response.body)).toBe(true);
          // E che ci sia almeno il workspace che abbiamo appena creato
          expect(response.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('DELETE /workspaces/:id', () => {
    it('dovrebbe cancellare il workspace e restituire 200', () => {
      return (
        request(app.getHttpServer() as any)
          // Usiamo l'ID salvato durante il test della POST
          .delete(`/api/workspaces/${workspaceAppenaCreatoId}`)
          .expect(200)
      );
    });
  });
});
