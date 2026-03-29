import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

//questo file è da fare
//mi serve consulenza di chi ha setuppato cognito

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: process.env.AWS_COGNITO_COGNITO_CLIENT_ID,
      issuer: process.env.AWS_COGNITO_AUTHORITY,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.AWS_COGNITO_AUTHORITY + '/.well-known/jwks.json',
      }),
    });
  }

  async validate(payload: any) {
    return { idUser: payload.sub, email: payload.email };
  }
}