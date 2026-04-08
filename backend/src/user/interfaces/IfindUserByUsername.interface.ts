import { UserInfo } from '../types/user.type';

export interface IFindUserByUsername {
  findByUsername(username: string): Promise<UserInfo | null>;
}

export const FindUserByUsernameToken = 'FIND_USER_BY_USERNAME';
