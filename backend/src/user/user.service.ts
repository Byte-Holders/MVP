import { Inject, Injectable } from '@nestjs/common';
import { IUserService } from './interfaces/IUserService.interface';
import { FindUserToken } from './interfaces/IfindUser.interface';
import { CreateUserToken} from './interfaces/ICreateUser.interface';
import type { ICreateUser } from './interfaces/ICreateUser.interface';
import type { IFindUser } from './interfaces/IfindUser.interface';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject(FindUserToken) private findUser: IFindUser,
        @Inject(CreateUserToken) private createUser: ICreateUser,
    ) {}

    async find(sub: string): Promise<User | null> {
        return this.findUser.find(sub);
    }

    async create(sub: string, username: string, email: string): Promise<User> {
        if (await this.findUser.find(sub)) {
            throw new Error('Utente con sub ' + sub + ' già esistente');
        }
        return this.createUser.create(sub, username, email);
    }
}
