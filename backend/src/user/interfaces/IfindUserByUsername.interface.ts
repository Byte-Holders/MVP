import { User } from "../schemas/user.schema";

export interface IFindUserByUsername {
  findByUsername(username: string): Promise<User | null>;
}

export const FindUserByUsernameToken = 'FIND_USER_BY_USERNAME';
