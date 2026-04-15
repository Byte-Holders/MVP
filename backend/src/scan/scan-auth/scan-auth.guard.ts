import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type ContainerRequest = { body: { token: string } };

@Injectable()
export class ScanAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('a');
    const request = context.switchToHttp().getRequest<ContainerRequest>();
    const token = request.body.token;
    console.log(`Received token: ${token}`);

    try {
      await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
