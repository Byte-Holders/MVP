import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { FindUserBySubToken } from '../user/interfaces/IfindUserBySub.interface';
import type { UserInfo } from '../user/types/user.type';

jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn().mockReturnValue(jest.fn()),
}));

const mockConfigService = {
  get: jest.fn().mockReturnValue('https://cognito.example.com/us-east-1_ABC'),
};

const mockFindUserBySub = {
  findBySub: jest.fn(),
};

const userFixture: UserInfo = {
  _id: 'user-id-1',
  sub: 'cognito|abc123',
  username: 'user1',
  email: 'user1@example.com',
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(
      mockConfigService as unknown as ConfigService,
      mockFindUserBySub,
    );
  });

  describe('validate', () => {
    it('restituisce RequestUser se lo user esiste nel db', async () => {
      // Arrange
      mockFindUserBySub.findBySub.mockResolvedValue(userFixture);
      const payload = {
        sub: 'cognito|abc123',
        username: 'user1',
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        sub: 'cognito|abc123',
        username: 'user1',
        userId: 'user-id-1',
      });
    });

    it('chiama findBySub con il sub del payload', async () => {
      // Arrange
      mockFindUserBySub.findBySub.mockResolvedValue(userFixture);

      // Act
      await strategy.validate({ sub: 'cognito|abc123', username: 'user1' });

      // Assert
      expect(mockFindUserBySub.findBySub).toHaveBeenCalledWith(
        'cognito|abc123',
      );
    });

    it('lancia errore se lo user non esiste nel db', async () => {
      // Arrange — utente non ancora registrato
      mockFindUserBySub.findBySub.mockResolvedValue(null);

      // Act & Assert
      await expect(
        strategy.validate({ sub: 'sub-inesistente', username: 'ghost' }),
      ).rejects.toThrow();
    });

    // ⚠️ Documenta il gap — dovrebbe essere UnauthorizedException non Error generico
    it('TODO: dovrebbe lanciare UnauthorizedException (ora lancia Error generico → 500)', async () => {
      mockFindUserBySub.findBySub.mockResolvedValue(null);

      // Il comportamento attuale lancia Error → NestJS risponde 500
      // Il comportamento corretto sarebbe UnauthorizedException → 401
      await expect(
        strategy.validate({ sub: 'sub-inesistente', username: 'ghost' }),
      ).rejects.toThrow(UnauthorizedException); // fallisce finché non si corregge
    });

    it('il messaggio di errore contiene il sub non trovato', async () => {
      mockFindUserBySub.findBySub.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: 'sub-inesistente', username: 'ghost' }),
      ).rejects.toThrow('sub-inesistente');
    });

    it('propaga eccezioni del servizio utente', async () => {
      // Arrange — il db è irraggiungibile
      mockFindUserBySub.findBySub.mockRejectedValue(
        new Error('DB connection error'),
      );

      // Act & Assert
      await expect(
        strategy.validate({ sub: 'cognito|abc123', username: 'user1' }),
      ).rejects.toThrow('DB connection error');
    });
  });
});
