import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import { FindUserToken } from './interfaces/IfindUser.interface';
import { UserService } from './user.service';
import { CreateUserToken } from './interfaces/ICreateUser.interface';
import { UserServiceToken } from './interfaces/IUserService.interface';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    {
      provide: FindUserToken,
      useClass: UserRepository,
    },
    {
      provide: CreateUserToken,
      useClass: UserRepository,
    },
    {
      provide: UserServiceToken,
      useClass: UserService,
    }
  ],
  exports: [UserServiceToken],
  controllers: [UserController],
})
export class UserModule {}
