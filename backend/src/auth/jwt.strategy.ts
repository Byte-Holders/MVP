import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  FindUserBySubToken,
  type IFindUserBySub,
} from 'src/user/interfaces/IfindUserBySub.interface copy';
import { UserInfo } from 'src/user/types/user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  constructor(
    private configService: ConfigService,
    @Inject(FindUserBySubToken) private userService: IFindUserBySub,
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
    const user: UserInfo | null = await this.userService.findBySub(payload.sub);
    if (!user) {
      throw new Error(
        'User con sub ' + payload.sub + ' non presente nel database',
      );
    }
    return {
      sub: payload.sub,
      username: payload.username,
      userId: user._id.toString(),
    };
  }
}
