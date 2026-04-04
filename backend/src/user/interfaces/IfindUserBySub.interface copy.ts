import { User } from "../schemas/user.schema";

export interface IFindUserBySub {
  findBySub(sub: string): Promise<User | null>;
}

export const FindUserBySubToken = 'FIND_USER_BY_SUB';
