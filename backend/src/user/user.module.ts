import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import { FindUserByUsernameToken } from './interfaces/IfindUserByUsername.interface';
import { UserService } from './user.service';
import { CreateUserToken } from './interfaces/ICreateUser.interface';
import { UserRepositoryToken } from './interfaces/IUserRepository.interface';
import { UserController } from './user.controller';
import { FindUserBySubToken } from './interfaces/IfindUserBySub.interface copy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    {
      provide: FindUserBySubToken,
      useClass: UserService,
    },
    {
      provide: FindUserByUsernameToken,
      useClass: UserService,
    },
    {
      provide: CreateUserToken,
      useClass: UserService,
    },
    {
      provide: UserRepositoryToken,
      useClass: UserRepository,
    },
  ],
  exports: [FindUserBySubToken, FindUserByUsernameToken, CreateUserToken],
  controllers: [UserController],
})
export class UserModule {}
