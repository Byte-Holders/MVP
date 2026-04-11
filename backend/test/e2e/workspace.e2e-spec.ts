import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

jest.mock('jwks-rsa', () => ({
    passportJwtSecret: () => {
      // Forniamo una chiave fittizia invece di "undefined" per accontentare passport-jwt
      return (req: any, header: any, payload: any, cb: any) => {
        if (cb) {
          cb(null, 'chiave-segreta-finta');
        }
      };
    },
}));

import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard'; 

describe('WorkspaceController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Accendiamo l'intera applicazione
    })
      // --- LA MAGIA DELLA SICUREZZA ---
      // Scavalchiamo il controllo del token JWT
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Facciamo passare sempre la richiesta HTTP
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
        await app.close();
    }
  });

  // --- I TEST HTTP ---

  describe('POST /workspaces/:workspaceId/repositories', () => {
    it('dovrebbe aggiungere una repository e restituire 201', () => {
      // Inventiamo un ID che sembri un vero ObjectId di Mongoose (24 caratteri)
      const fakeWorkspaceId = '507f1f77bcf86cd799439011'; 
      
      return request(app.getHttpServer() as any) // Assicurati di mantenere la soluzione TypeScript che avevi scelto!
        .post(`/workspaces/${fakeWorkspaceId}/repositories`) 
        .send({
          // Guardando il tuo controller, si aspetta un AddRepositoryDto.
          // Quindi gli passiamo l'URL della repository:
          repositoryUrl: 'https://github.com/test/repo-e2e',
          // accessToken: 'opzionale' -> se non è obbligatorio nel DTO possiamo ometterlo
        })
        .expect(201) // NestJS di default risponde con 201 ai metodi @Post()
        .then((response) => {
          // Il metodo nel controller restituisce Promise<void>, 
          // quindi non ci aspettiamo un corpo (body) nella risposta, ci basta che il codice HTTP sia 201!
          expect(response.status).toBe(201);
        });
    });
  });
});