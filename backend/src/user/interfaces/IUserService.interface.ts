import { User } from "../schemas/user.schema";

export interface IUserService {
  find(sub: string): Promise<User | null>;
  create(sub: string, username: string, email: string): Promise<User>;
}

export const UserServiceToken = 'USER_SERVICE';