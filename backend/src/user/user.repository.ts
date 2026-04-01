import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { IGetUserIdFromSub } from './interfaces/getUserIdFromSub.interface';

@Injectable()
export class UserRepository implements IGetUserIdFromSub {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async getUserIdFromSub(sub: string): Promise<string> {
        const user = await this.userModel.findOne({ sub: sub });
        if (!user) {
            throw new Error("Utente con sub " + sub + " non trovato");
        }

        return user._id.toString();
    }
}