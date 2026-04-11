import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';

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

describe('WorkspaceController (e2e)', () => {
  let app: INestApplication;
  let workspaceRealeId: string;
  let workspaceModel: any; // Lo dichiariamo qui così lo vedono tutti i test!

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], 
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) 
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    workspaceModel = app.get(getModelToken('Workspace'));
    
    const nuovoWorkspace = await workspaceModel.create({
      name: `Workspace per E2E ${Date.now()}`,
      ownerId: 'user-test-e2e',
      creationDate: new Date(),
      repositories: [] // Torniamo all'array vuoto! Nessun errore Mongoose.
    });
    
    workspaceRealeId = nuovoWorkspace._id.toString();
  });

  afterAll(async () => {
    if (app) {
        await app.close();
    }
  });

  // --- I TEST HTTP ---

  describe('POST /workspaces/:workspaceId/repositories', () => {
    it('dovrebbe aggiungere una repository e restituire 201', () => {
      return request(app.getHttpServer() as any) 
        .post(`/api/workspaces/${workspaceRealeId}/repositories`) 
        .send({
          repositoryUrl: 'https://github.com/test/repo-e2e',
        })
        .expect(201);
    });
  });

  describe('DELETE /workspaces/:workspaceId/repositories/:id', () => {
    it('dovrebbe rimuovere una repository dal workspace e restituire 200', async () => {
      
      const workspaceAggiornato = await workspaceModel.findById(workspaceRealeId);
      const repoAggiunta = workspaceAggiornato.repositories[0];
      
      // Ora sappiamo che la proprietà si chiama "repoId"
      // Aggiungiamo anche .toString() perché Mongoose potrebbe restituirlo come oggetto ObjectId
      const repoIdDaCancellare = repoAggiunta.repoId.toString();

      const response = await request(app.getHttpServer() as any)
        .delete(`/api/workspaces/${workspaceRealeId}/repositories/${repoIdDaCancellare}`);
        
      expect(response.status).toBe(200);
    });
  });
});