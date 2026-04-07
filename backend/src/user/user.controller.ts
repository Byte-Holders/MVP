import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { JwtRegistrationGuard } from 'src/auth/jwt-registration.guard';
import { Request } from '@nestjs/common';
import { CreateUserToken, type ICreateUser } from './interfaces/ICreateUser.interface';
import { CreateUserResponseDto } from './dto/createuser.responseDto';


@Controller('user')
export class UserController {
    constructor(@Inject(CreateUserToken) private userService: ICreateUser) {}

    @UseGuards(JwtRegistrationGuard)
    @Post('/register')
    async register(@Request() req) {
        const responseDto: CreateUserResponseDto = await this.userService.create(req.user.sub, req.user.username, req.user.email);
        return responseDto;
    }
    
}
