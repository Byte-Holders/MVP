import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { IUserRepository } from './interfaces/IUserRepository.interface';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findBySub(sub: string): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ sub: sub })
      .lean({ versionKey: false })
      .exec();
    return user;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ username: username })
      .lean({ versionKey: false })
      .exec();
    return user;
  }

  async create(
    sub: string,
    username: string,
    email: string,
  ): Promise<UserEntity> {
    const user = new this.userModel({
      sub: sub,
      username: username,
      email: email,
    });
    return (await user.save()).toObject({ versionKey: false });
  }
}
