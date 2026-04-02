export interface IGetUserIdFromSub {
  getUserIdFromSub(sub: string): Promise<string>;
}

export const GetUserIdFromSubToken = 'GET_USER_ID_FROM_SUB';
