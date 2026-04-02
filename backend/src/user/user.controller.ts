import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { type IUserService, UserServiceToken } from './interfaces/IUserService.interface';
import { JwtRegistrationGuard } from 'src/auth/jwt-registration.guard';
import { Request } from '@nestjs/common';


@Controller('user')
export class UserController {
    constructor(@Inject(UserServiceToken) private userService: IUserService) {}

    @UseGuards(JwtRegistrationGuard)
    @Post('/register')
    async register(@Request() req) {
        return this.userService.create(req.user.sub, req.user.username, req.user.email);
    }
}
