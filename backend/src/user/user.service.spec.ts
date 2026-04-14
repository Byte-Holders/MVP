import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepositoryToken } from './interfaces/IUserRepository.interface';
import type { UserEntity } from './entity/user.entity';

//Mock factory per il repository, con metodi mockati usando jest.fn()
const mockUserRepository = () => ({
  findBySub: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
});

type MockUserRepository = ReturnType<typeof mockUserRepository>;

// Fixture dati riutilizzabili, user fittizzio
const userFixture: UserEntity = {
  _id: 'user-id-1',
  sub: 'cognito|abc123',
  username: 'user1',
  email: 'user1@example.com',
};

//  Suite di test
describe('UserService', () => {
  let service: UserService;
  let repo: MockUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: 'USER_REPOSITORY', useValue: mockUserRepository() }],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<MockUserRepository>(UserRepositoryToken);
  });

  // findBySub
  describe('findBySub', () => {
    it('restituisce lo UserInfo se il sub esiste', async () => {
      // Arrange
      repo.findBySub.mockResolvedValue(userFixture);

      // Act
      const result = await service.findBySub('cognito|abc123');

      // Assert
      expect(result).toEqual(userFixture);
      expect(repo.findBySub).toHaveBeenCalledWith('cognito|abc123');
    });

    it('restituisce null se il sub non esiste', async () => {
      // Arrange
      repo.findBySub.mockResolvedValue(null);

      // Act
      const result = await service.findBySub('sub-inesistente');

      // Assert
      expect(result).toBeNull();
    });

    it('propaga eccezioni del repository', async () => {
      // Arrange
      repo.findBySub.mockRejectedValue(new Error('DB connection error'));

      // Act & Assert
      await expect(service.findBySub('sub')).rejects.toThrow(
        'DB connection error',
      );
    });
  });

  //  findByUsername
  describe('findByUsername', () => {
    it('restituisce lo UserInfo se lo username esiste', async () => {
      // Arrange
      repo.findByUsername.mockResolvedValue(userFixture);

      // Act
      const result = await service.findByUsername('giulia');

      // Assert
      expect(result).toEqual(userFixture);
      expect(repo.findByUsername).toHaveBeenCalledWith('giulia');
    });

    it('restituisce null se lo username non esiste', async () => {
      // Arrange
      repo.findByUsername.mockResolvedValue(null);

      // Act
      const result = await service.findByUsername('username-inesistente');

      // Assert
      expect(result).toBeNull();
    });

    it('propaga eccezioni del repository', async () => {
      // Arrange
      repo.findByUsername.mockRejectedValue(new Error('DB connection error'));

      // Act & Assert
      await expect(service.findByUsername('giulia')).rejects.toThrow(
        'DB connection error',
      );
    });
  });

  //  create
  describe('create', () => {
    it('crea e restituisce il nuovo utente se il sub non esiste', async () => {
      // Arrange — findBySub restituisce null: utente non ancora registrato
      repo.findBySub.mockResolvedValue(null);
      repo.create.mockResolvedValue(userFixture);

      // Act
      const result = await service.create(
        'cognito|abc123',
        'user1',
        'user1@example.com',
      );

      // Assert
      expect(result).toEqual(userFixture);
      expect(repo.create).toHaveBeenCalledWith(
        'cognito|abc123',
        'user1',
        'user1@example.com',
      );
    });

    it('lancia ConflictException se il sub è già registrato', async () => {
      // Arrange — utente già esistente con questo sub
      repo.findBySub.mockResolvedValue(userFixture);

      // Act & Assert
      await expect(
        service.create('cognito|abc123', 'user1', 'user1@example.com'),
      ).rejects.toThrow(ConflictException);

      // Il repository NON deve tentare la creazione
      expect(repo.create).not.toHaveBeenCalled();
    });

    //propagazione dell'errore del DB
    it('non chiama create se findBySub fallisce', async () => {
      // Arrange
      repo.findBySub.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(
        service.create('cognito|abc123', 'user1', 'user1@example.com'),
      ).rejects.toThrow('DB error');

      expect(repo.create).not.toHaveBeenCalled();
    });
  });
});
