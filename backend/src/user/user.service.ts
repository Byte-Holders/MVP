import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { ICreateUser } from './interfaces/ICreateUser.interface';
import { IFindUserByUsername } from './interfaces/IfindUserByUsername.interface';
import { IFindUserBySub } from './interfaces/IfindUserBySub.interface';
import {
  UserRepositoryToken,
  type IUserRepository,
} from './interfaces/IUserRepository.interface';
import { UserInfo } from './types/user.type';

@Injectable()
export class UserService
  implements IFindUserBySub, IFindUserByUsername, ICreateUser
{
  constructor(@Inject(UserRepositoryToken) private findUser: IUserRepository) {}

  async findBySub(sub: string): Promise<UserInfo | null> {
    return this.findUser.findBySub(sub);
  }

  async findByUsername(username: string): Promise<UserInfo | null> {
    return this.findUser.findByUsername(username);
  }

  async create(
    sub: string,
    username: string,
    email: string,
  ): Promise<UserInfo> {
    if (await this.findUser.findBySub(sub)) {
      throw new ConflictException('Utente con sub ' + sub + ' già esistente');
    }
    return this.findUser.create(sub, username, email);
  }
}
