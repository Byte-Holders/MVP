import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

//questo file è da fare
//mi serve consulenza di chi ha setuppato cognito

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //audience: process.env.AWS_COGNITO_COGNITO_CLIENT_ID,
      issuer: configService.get<string>('AWS_COGNITO_AUTHORITY'),
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: configService.get<string>('AWS_COGNITO_AUTHORITY') + '/.well-known/jwks.json',
      }),
    });
  }

  async validate(payload: any) {
    console.log('JWT payload validated:', payload);
    return { sub: payload.sub, email: payload.email, username: payload['cognito:username'] };
  }
}