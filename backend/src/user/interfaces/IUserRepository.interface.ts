import { UserEntity } from '../entity/user.entity';

export interface IUserRepository {
  findBySub(sub: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  create(sub: string, username: string, email: string): Promise<UserEntity>;
}

export const UserRepositoryToken = 'USER_REPOSITORY';
