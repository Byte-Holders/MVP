import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRegistrationGuard } from './jwt-registration.guard';
import { JwtRegistrationStrategy } from './jwt.registration.strategy';

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }),UserModule],
  providers: [JwtStrategy, JwtAuthGuard, JwtRegistrationStrategy, JwtRegistrationGuard],
  exports: [PassportModule, JwtAuthGuard, JwtRegistrationGuard],
})
export class AuthModule {}
