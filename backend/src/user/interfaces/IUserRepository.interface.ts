import { User } from "../schemas/user.schema";

export interface IUserRepository {
  findBySub(sub: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(sub: string, username: string, email: string): Promise<User>;
}

export const UserRepositoryToken = 'USER_REPOSITORY';