import { UserInfo } from '../types/user.type';

export interface IFindUserBySub {
  findBySub(sub: string): Promise<UserInfo | null>;
}

export const FindUserBySubToken = 'FIND_USER_BY_SUB';
