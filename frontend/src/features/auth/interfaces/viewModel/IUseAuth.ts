import type { AuthState } from '../../types/IAuthState'

export interface IAuthViewModel extends AuthState {
  login: (redirectTo?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}
