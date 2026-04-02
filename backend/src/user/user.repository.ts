import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { IFindUser } from './interfaces/IfindUser.interface';
import { ICreateUser } from './interfaces/ICreateUser.interface';

@Injectable()
export class UserRepository implements IFindUser, ICreateUser {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async find(sub: string): Promise<User | null> {
    const user = await this.userModel.findOne({ sub: sub });
    return user;
  }

  async create(sub: string, username: string, email: string): Promise<User> {
    const user = new this.userModel({ sub: sub, username: username, email: email });
    return user.save();
  }
}
