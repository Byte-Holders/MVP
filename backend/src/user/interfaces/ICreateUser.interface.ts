import { UserInfo } from "../types/user.type";

export interface ICreateUser {
  create(sub: string, username: string, email: string): Promise<UserInfo>;
}

export const CreateUserToken = 'CREATE_USER';
