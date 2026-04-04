import { Inject, Injectable } from '@nestjs/common';
import type { ICreateUser } from './interfaces/ICreateUser.interface';
import { User } from './schemas/user.schema';
import { IFindUserByUsername } from './interfaces/IfindUserByUsername.interface';
import { IFindUserBySub } from './interfaces/IfindUserBySub.interface copy';
import { UserRepositoryToken, type IUserRepository } from './interfaces/IUserRepository.interface';

@Injectable()
export class UserService implements IFindUserBySub, IFindUserByUsername, ICreateUser {
    constructor(
        @Inject(UserRepositoryToken) private findUser: IUserRepository,
    ) {}

    async findBySub(sub: string): Promise<User | null> {
        return this.findUser.findBySub(sub);
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.findUser.findByUsername(username);
    }

    async create(sub: string, username: string, email: string): Promise<User> {
        if (await this.findUser.findBySub(sub)) {
            throw new Error('Utente con sub ' + sub + ' già esistente');
        }
        return this.findUser.create(sub, username, email);
    }
}
