import { User } from "../schemas/user.schema";

export interface ICreateUser {
  create(sub: string, username: string, email: string): Promise<User>;
}

export const CreateUserToken = 'CREATE_USER';
