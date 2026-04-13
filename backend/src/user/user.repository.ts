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
    if (!user) {
      return null;
    } else {
      return {
        _id: user._id.toString(),
        sub: user.sub,
        username: user.username,
        email: user.email
      }
    }

  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ username: username })
      .lean({ versionKey: false })
      .exec();
    if (!user) {
      return null;
    } else {
      return {
        _id: user._id.toString(),
        sub: user.sub,
        username: user.username,
        email: user.email
      }
    }
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
    const savedUser = (await user.save()).toObject({ versionKey: false });
    return {
      _id: savedUser._id.toString(),
      sub: savedUser.sub,
      username: savedUser.username,
      email: savedUser.email
    };
  }
}
