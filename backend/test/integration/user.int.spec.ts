import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server'; // mongodb-memory-server avvia un'istanza MongoDB reale in memoria
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../../src/user/user.service';
import { UserRepository } from '../../src/user/user.repository';
import { User, UserSchema } from '../../src/user/schemas/user.schema';
import { UserRepositoryToken } from '../../src/user/interfaces/IUserRepository.interface';
import { ConflictException } from '@nestjs/common';

describe('UserModule (integration)', () => {
  let module: TestingModule;
  let mongod: MongoMemoryServer;
  let service: UserService;
  let userModel: Model<User>;

  // beforeAll — il DB si avvia una volta sola per tutta la suite
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        UserService,
        UserRepository,
        { provide: UserRepositoryToken, useClass: UserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  // Pulisce il DB tra un test e l'altro per isolamento
  afterEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  // create

  describe('create', () => {
    it("controllo dell'effettiva presenza nel database dell'utente creato", async () => {
      // Act
      const result = await service.create(
        'cognito|abc123',
        'user1',
        'user1@example.com',
      );

      // Assert sul valore restituito
      expect(result.sub).toBe('cognito|abc123');
      expect(result.username).toBe('user1');
      expect(result._id).toBeDefined();

      // Assert diretto sul DB — verifica la persistenza reale
      const saved = await userModel.findOne({ sub: 'cognito|abc123' }).lean();
      expect(saved).not.toBeNull();
      expect(saved!.email).toBe('user1@example.com');
    });

    it('lancia ConflictException se il sub è già registrato', async () => {
      // Arrange — inserisce utente direttamente nel DB
      await userModel.create({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });

      // Act & Assert
      await expect(
        service.create('cognito|abc123', 'user1', 'user1@example.com'),
      ).rejects.toThrow(ConflictException);

      // Verifica che nel DB ci sia ancora un solo utente
      const count = await userModel.countDocuments();
      expect(count).toBe(1);
    });

    /*it('lancia errore MongoDB se la email è duplicata', async () => {
      // Arrange
      await userModel.create({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });

      // Act & Assert — sub diverso ma email uguale → vincolo unique MongoDB
      //  Questo test documenta il gap: il service non gestisce questo caso
      await expect(
        service.create('cognito|xyz999', 'giulia2', 'giulia@example.com'),
      ).rejects.toThrow(); // lancia errore MongoDB non gestito
    });*/

    //__v è un campo che Mongoose aggiunge automaticamente, se non lo si rimuove, ogni oggetto restituito dal backend conterrebbe questo campo extra che il frontend non si aspetta
    //controlla il rispetto dell ariga versionKey: false in user.repositry.ts
    it('il risultato non contiene __v (versionKey)', async () => {
      const result = await service.create(
        'cognito|abc123',
        'user1',
        'user1@example.com',
      );
      expect((result as any).__v).toBeUndefined();
    });
  });

  //  findBySub

  describe('findBySub', () => {
    it('trova un utente esistente per sub', async () => {
      // Arrange — inserimento diretto nel DB
      await userModel.create({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });

      // Act
      const result = await service.findBySub('cognito|abc123');

      // Assert
      expect(result).not.toBeNull();
      expect(result!.username).toBe('user1');
    });

    it('restituisce null per sub inesistente', async () => {
      const result = await service.findBySub('sub-inesistente');
      expect(result).toBeNull();
    });

    it('il risultato non contiene __v', async () => {
      await userModel.create({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });

      const result = await service.findBySub('cognito|abc123');
      expect((result as any).__v).toBeUndefined();
    });
  });

  //  findByUsername

  describe('findByUsername', () => {
    it('trova un utente esistente per username', async () => {
      await userModel.create({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });

      const result = await service.findByUsername('user1');

      expect(result).not.toBeNull();
      expect(result!.sub).toBe('cognito|abc123');
    });

    it('restituisce null per username inesistente', async () => {
      const result = await service.findByUsername('username-inesistente');
      expect(result).toBeNull();
    });
  });
});
