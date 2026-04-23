import { BadRequestException } from '@nestjs/common';
import { JwtRegistrationStrategy } from './jwt.registration.strategy';
import { ConfigService } from '@nestjs/config';

// Mock ConfigService — serve solo al costruttore per leggere le env
const mockConfigService = {
  get: jest.fn().mockReturnValue('https://cognito.example.com/us-east-1_ABC'),
};

// Bypassa il costruttore di PassportStrategy che chiama jwks-rsa
// (richiederebbe una connessione di rete reale)
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn().mockReturnValue(jest.fn()),
}));

describe('JwtRegistrationStrategy', () => {
  let strategy: JwtRegistrationStrategy;

  beforeEach(() => {
    strategy = new JwtRegistrationStrategy(
      mockConfigService as unknown as ConfigService,
    );
  });

  describe('validate', () => {
    it('restituisce sub, username e email dato un id token valido', async () => {
      // Arrange — payload di un ID token Cognito
      const payload = {
        sub: 'cognito|abc123',
        token_use: 'id',
        'cognito:username': 'user1',
        email: 'user1@example.com',
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        sub: 'cognito|abc123',
        username: 'user1',
        email: 'user1@example.com',
      });
    });

    it('lancia BadRequestException se token_use è "access" invece che "id"', async () => {
      // Arrange — access token invece di id token
      const payload = {
        sub: 'cognito|abc123',
        token_use: 'access',
        'cognito:username': 'user1',
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lancia BadRequestException se token_use è assente', async () => {
      // Arrange — payload senza token_use
      const payload = {
        sub: 'cognito|abc123',
        'cognito:username': 'user1',
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lancia BadRequestException se token_use è un valore inatteso', async () => {
      const payload = {
        sub: 'cognito|abc123',
        token_use: 'different_value',
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
