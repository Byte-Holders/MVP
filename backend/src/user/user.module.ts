import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import { GetUserIdFromSubToken } from './interfaces/getUserIdFromSub.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    {
      provide: GetUserIdFromSubToken,
      useClass: UserRepository,
    },
  ],
  exports: [GetUserIdFromSubToken],
})
export class UserModule {}
