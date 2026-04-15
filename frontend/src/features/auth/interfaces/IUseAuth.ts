export interface IAuthViewModel {
  isAuthenticated: boolean
  isLoading: boolean
  user: { username: string } | null
  login: (redirectTo?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}
