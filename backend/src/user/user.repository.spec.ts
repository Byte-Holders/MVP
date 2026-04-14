import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { User } from './schemas/user.schema';
import type { UserEntity } from './entity/user.entity';

// Mock del Model Mongoose
// Mongoose ha un'API a catena (.findOne().lean().exec()) quindi bisogna mockare ogni step della catena
const mockUserModel = () => {
  const saveMock = jest.fn();
  const toObjectMock = jest.fn();
  const execMock = jest.fn();
  const leanMock = jest.fn().mockReturnValue({ exec: execMock });
  const findOneMock = jest.fn().mockReturnValue({ lean: leanMock });

  // Il costruttore del Model (new this.userModel({...})) deve restituire un oggetto con .save()
  class ModelConstructor {
    // Proprietà dell'istanza — corrispondono ai campi di User
    sub?: string;
    username?: string;
    email?: string;

    constructor(data: Partial<User>) {
      Object.assign(this, data);
    }

    // Metodo di istanza mockato
    save = saveMock;

    // Metodo statico mockato — corrisponde a this.userModel.findOne(...)
    static findOne = findOneMock;
  }

  return {
    ModelConstructor,
    saveMock,
    toObjectMock,
    execMock,
    leanMock,
    findOneMock,
  };
};

const userFixture: UserEntity = {
  _id: 'user-id-1',
  sub: 'cognito|abc123',
  username: 'user1',
  email: 'user1@example.com',
};

describe('UserRepository', () => {
  let repository: UserRepository;
  let mocks: ReturnType<typeof mockUserModel>;

  beforeEach(async () => {
    mocks = mockUserModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(User.name),
          useValue: mocks.ModelConstructor,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  //  findBySub
  describe('findBySub', () => {
    it('restituisce lo user se trovato', async () => {
      mocks.execMock.mockResolvedValue(userFixture);

      const result = await repository.findBySub('cognito|abc123');

      expect(result).toEqual(userFixture);
      expect(mocks.findOneMock).toHaveBeenCalledWith({ sub: 'cognito|abc123' });
      // Verifica che lean sia chiamato con versionKey: false, controllando che la catena sia corretta
      expect(mocks.leanMock).toHaveBeenCalledWith({ versionKey: false });
    });

    it('restituisce null se non trovato', async () => {
      mocks.execMock.mockResolvedValue(null);

      const result = await repository.findBySub('sub-inesistente');

      expect(result).toBeNull();
    });
  });

  //  findByUsername
  describe('findByUsername', () => {
    it('restituisce lo user se trovato', async () => {
      mocks.execMock.mockResolvedValue(userFixture);

      const result = await repository.findByUsername('user1');

      expect(result).toEqual(userFixture);
      expect(mocks.findOneMock).toHaveBeenCalledWith({ username: 'user1' });
    });

    it('restituisce null se non trovato', async () => {
      mocks.execMock.mockResolvedValue(null);

      const result = await repository.findByUsername('username-inesistente');

      expect(result).toBeNull();
    });
  });

  // create
  describe('create', () => {
    it('salva il documento e restituisce il plain object', async () => {
      // save() restituisce un documento Mongoose con .toObject()
      mocks.saveMock.mockResolvedValue({ toObject: mocks.toObjectMock });
      mocks.toObjectMock.mockReturnValue(userFixture);

      const result = await repository.create(
        'cognito|abc123',
        'user1',
        'user1@example.com',
      );

      expect(result).toEqual(userFixture);
      expect(mocks.saveMock).toHaveBeenCalled();
      // toObject deve essere chiamato con versionKey: false
      expect(mocks.toObjectMock).toHaveBeenCalledWith({ versionKey: false });
    });

    it('propaga errore MongoDB se il sub è duplicato', async () => {
      // MongoDB lancia un errore con code 11000 per violazione unique
      const mongoError = Object.assign(new Error('duplicate key'), {
        code: 11000,
      });
      mocks.saveMock.mockRejectedValue(mongoError);

      await expect(
        repository.create('cognito|abc123', 'user1', 'user1@example.com'),
      ).rejects.toThrow('duplicate key');
    });
  });
});
