import type { AuthSession } from 'aws-amplify/auth'

export interface IAuthApi {
  fetchCurrentUser: () => Promise<{ username: string }>
  fetchSession: () => Promise<AuthSession>
  signIn: (redirectUrl?: string) => Promise<void>
  logOut: () => Promise<void>
  removeCurrentUser: () => Promise<void>
}
