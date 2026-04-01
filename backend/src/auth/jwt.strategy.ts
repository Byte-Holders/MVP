import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GetUserIdFromSubToken } from '../user/interfaces/getUserIdFromSub.interface';
import type { IGetUserIdFromSub } from '../user/interfaces/getUserIdFromSub.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject(GetUserIdFromSubToken) private userRepository: IGetUserIdFromSub,
  ) {
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
        jwksUri:
          configService.get<string>('AWS_COGNITO_AUTHORITY') +
          '/.well-known/jwks.json',
      }),
    });
  }

  async validate(payload: any) {
    const userId = await this.userRepository.getUserIdFromSub(payload.sub);
    return { sub: payload.sub, username: payload.username, userId: userId };
  }
}
