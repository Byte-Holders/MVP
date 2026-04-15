import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { JwtRegistrationStrategy } from '../../src/auth/jwt.registration.strategy';
import { JwtStrategy } from '../../src/auth/jwt.strategy';
import { UserRepository } from '../../src/user/user.repository';
import { UserService } from '../../src/user/user.service';
import { User, UserSchema } from '../../src/user/schemas/user.schema';
import { UserRepositoryToken } from '../../src/user/interfaces/IUserRepository.interface';
import { FindUserBySubToken } from '../../src/user/interfaces/IfindUserBySub.interface';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn().mockReturnValue(jest.fn()),
}));

const mockConfigService = {
  get: jest.fn().mockReturnValue('https://cognito.example.com/us-east-1_ABC'),
};

describe('AuthModule strategies (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let jwtStrategy: JwtStrategy;
  let jwtRegistrationStrategy: JwtRegistrationStrategy;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        UserService,
        UserRepository,
        { provide: UserRepositoryToken, useClass: UserRepository },
        { provide: FindUserBySubToken, useClass: UserService },
        { provide: ConfigService, useValue: mockConfigService },
        JwtStrategy,
        JwtRegistrationStrategy,
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    jwtRegistrationStrategy = module.get<JwtRegistrationStrategy>(
      JwtRegistrationStrategy,
    );
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  // JwtRegistrationStrategy.validate

  describe('JwtRegistrationStrategy.validate', () => {
    it('restituisce i dati utente per un id token valido', async () => {
      const payload = {
        sub: 'cognito|abc123',
        token_use: 'id',
        'cognito:username': 'user1',
        email: 'user1@example.com',
      };

      const result = await jwtRegistrationStrategy.validate(payload);

      expect(result).toEqual({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });
    });

    it('lancia BadRequestException per access token', async () => {
      const payload = {
        sub: 'cognito|abc123',
        token_use: 'access',
        'cognito:username': 'user1',
      };

      await expect(jwtRegistrationStrategy.validate(payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // JwtStrategy.validate con DB reale

  describe('JwtStrategy.validate', () => {
    it('trova lo user nel DB reale e restituisce RequestUser', async () => {
      // Arrange — utente già registrato nel DB
      const created = await userModel.create({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });

      // Act
      const result = await jwtStrategy.validate({
        sub: 'cognito|abc123',
        username: 'user1',
      });

      // Assert
      expect(result.sub).toBe('cognito|abc123');
      expect(result.userId).toBe(created._id.toString());
    });

    it('lancia errore se lo user non è nel DB', async () => {
      // Nessun utente nel DB con sub 'sub-inesistente'
      await expect(
        jwtStrategy.validate({ sub: 'sub-inesistente', username: 'ghost' }),
      ).rejects.toThrow();
    });
  });
});
