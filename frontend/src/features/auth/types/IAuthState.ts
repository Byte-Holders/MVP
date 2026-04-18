export type AuthState = {
  isAuthenticated: boolean
  isLoading: boolean
  user: { username: string } | null
}
