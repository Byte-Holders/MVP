// src/user/user.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UserController } from './user.controller';
import { CreateUserToken } from './interfaces/ICreateUser.interface';
import type { UserInfo } from './types/user.type';

const mockUserService = () => ({
  create: jest.fn(),
});

type MockUserService = ReturnType<typeof mockUserService>;

const userFixture: UserInfo = {
  _id: 'user-id-1',
  sub: 'cognito|abc123',
  username: 'user1',
  email: 'user1@example.com',
};

// Simula req.user popolato dal JwtRegistrationGuard
const mockRequest = {
  user: {
    sub: 'cognito|abc123',
    username: 'user1',
    email: 'user1@example.com',
  },
};

describe('UserController', () => {
  let controller: UserController;
  let service: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: 'CREATE_USER', useValue: { execute: jest.fn() } }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<MockUserService>(CreateUserToken);
  });

  describe('register', () => {
    it('chiama service.create con i dati estratti da req.user', async () => {
      // Arrange
      service.create.mockResolvedValue(userFixture);

      // Act
      await controller.register(mockRequest as any);

      // Assert — verifica che sub, username e email arrivino dal token JWT
      expect(service.create).toHaveBeenCalledWith(
        'cognito|abc123',
        'user1',
        'user1@example.com',
      );
    });

    it('restituisce il CreateUserResponseDto corretto', async () => {
      // Arrange
      service.create.mockResolvedValue(userFixture);

      // Act
      const result = await controller.register(mockRequest as any);

      // Assert
      expect(result).toEqual(userFixture);
      expect(result._id).toBeDefined();
      expect(result.sub).toBe('cognito|abc123');
    });

    it('propaga ConflictException se l utente è già registrato', async () => {
      // Arrange — il service lancia ConflictException (sub duplicato)
      service.create.mockRejectedValue(
        new ConflictException('Utente già esistente'),
      );

      // Act & Assert
      await expect(controller.register(mockRequest as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
