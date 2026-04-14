import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  it('estende AuthGuard con la strategia jwt-auth', () => {
    // AuthGuard('jwt-auth') restituisce una classe base
    // JwtAuthGuard deve essere una sua istanza
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(AuthGuard('jwt-auth'));
  });

  it('è definita', () => {
    expect(JwtAuthGuard).toBeDefined();
  });
});
