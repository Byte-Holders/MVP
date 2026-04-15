import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { JwtRegistrationGuard } from '../auth/jwt-registration.guard';
import { Request } from '@nestjs/common';
import {
  CreateUserToken,
  type ICreateUser,
} from './interfaces/ICreateUser.interface';
import { CreateUserResponseDto } from './dto/createuser.responseDto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(@Inject(CreateUserToken) private userService: ICreateUser) {}

  @ApiOperation({ summary: "Registra un nuovo utente utilizzando l'ID token" })
  @ApiResponse({
    status: 201,
    description: 'Utente registrato con successo',
    type: CreateUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token di registrazione non valido o utente già registrato',
  })
  @UseGuards(JwtRegistrationGuard)
  @Post('/register')
  async register(@Request() req) {
    const responseDto: CreateUserResponseDto = await this.userService.create(
      req.user.sub,
      req.user.username,
      req.user.email,
    );
    return responseDto;
  }
}
