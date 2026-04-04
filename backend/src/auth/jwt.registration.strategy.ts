import { Injectable, BadRequestException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRegistrationStrategy extends PassportStrategy(Strategy, "jwtRegistration") {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: configService.get<string>('AWS_COGNITO_AUTHORITY'),
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri:
          configService.get<string>('AWS_COGNITO_AUTHORITY') +
          '/.well-known/jwks.json',
      }),
    });
    
  }

  async validate(payload: any) {
    if(!payload.token_use || payload.token_use !== 'id') {
      throw new BadRequestException('Access Token non valido, usare ID Token per la registrazione');
    }
    return { sub: payload.sub, username: payload["cognito:username"], email: payload.email };
  }
}
