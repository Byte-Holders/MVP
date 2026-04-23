import { JwtRegistrationGuard } from './jwt-registration.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtRegistrationGuard', () => {
  it('estende AuthGuard con la strategia jwtRegistration', () => {
    const guard = new JwtRegistrationGuard();
    expect(guard).toBeInstanceOf(AuthGuard('jwtRegistration'));
  });

  it('è definita', () => {
    expect(JwtRegistrationGuard).toBeDefined();
  });
});
