import { User } from "../schemas/user.schema";

export interface IFindUser {
  find(sub: string): Promise<User | null>;
}

export const FindUserToken = 'FIND_USER';
