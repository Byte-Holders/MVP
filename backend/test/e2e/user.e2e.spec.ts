import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/user/schemas/user.schema';

// Per i test e2e che coinvolgono JWT firmati da Cognito
// si mocka l'intera validazione della firma a livello di strategy
// sostituendo secretOrKeyProvider con una chiave statica di test
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn().mockImplementation(() => {
    // Restituisce una funzione che accetta (req, rawJwtToken, done) e chiama done con la chiave di test
    return (_req: any, _rawToken: any, done: Function) => {
      done(null, 'test-secret-key');
    };
  }),
}));

describe('User e2e — flusso registrazione', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.AWS_COGNITO_AUTHORITY = 'https://cognito.example.com/test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  // POST /user/register

  describe('POST /user/register', () => {
    it('401 — senza Authorization header', async () => {
      await request(app.getHttpServer()).post('/user/register').expect(401);
    });

    it('401 — con token malformato', async () => {
      await request(app.getHttpServer())
        .post('/user/register')
        .set('Authorization', 'Bearer token-non-valido')
        .expect(401);
    });

    it('400 — con access token invece di id token', async () => {
      // Genera un JWT firmato con la chiave di test che ha token_use: 'access' invece di 'id'
      const jwt = require('jsonwebtoken');
      const accessToken = jwt.sign(
        {
          sub: 'cognito|abc123',
          token_use: 'access', // per la registrazione serve id token
          'cognito:username': 'user1',
          email: 'user1@example.com',
          iss: 'https://cognito.example.com/test',
        },
        'test-secret-key',
        { algorithm: 'HS256' }, // jwks-rsa mockato accetta qualsiasi algo
      );

      await request(app.getHttpServer())
        .post('/user/register')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('201 — registrazione con id token valido', async () => {
      const jwt = require('jsonwebtoken');
      const idToken = jwt.sign(
        {
          sub: 'cognito|abc123',
          token_use: 'id',
          'cognito:username': 'user1',
          email: 'user1@example.com',
          iss: 'https://cognito.example.com/test',
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      );

      const response = await request(app.getHttpServer())
        .post('/user/register')
        .set('Authorization', `Bearer ${idToken}`)
        .expect(201);

      expect(response.body.sub).toBe('cognito|abc123');
      expect(response.body.username).toBe('user1');
      expect(response.body._id).toBeDefined();

      // Verifica la persistenza nel DB
      const saved = await userModel.findOne({ sub: 'cognito|abc123' });
      expect(saved).not.toBeNull();
    });

    it('409 — tentativo di registrazione con un sub già esistente', async () => {
      // Arrange — utente già nel DB
      await userModel.create({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });

      const jwt = require('jsonwebtoken');
      const idToken = jwt.sign(
        {
          sub: 'cognito|abc123',
          token_use: 'id',
          'cognito:username': 'user1',
          email: 'user1@example.com',
          iss: 'https://cognito.example.com/test',
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      );

      await request(app.getHttpServer())
        .post('/user/register')
        .set('Authorization', `Bearer ${idToken}`)
        .expect(409);
    });
  });
});
