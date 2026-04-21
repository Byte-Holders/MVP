import { useState, useEffect } from 'react'
import { authApi } from '../model/authApi'
import type { IAuthApi } from '../interfaces/model/IAuthApi'
import type { IAuthViewModel } from '../interfaces/viewModel/IUseAuth'
import type { AuthState } from '../types/IAuthState'

export function useAuth(api: IAuthApi = authApi): IAuthViewModel {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const user = await api.fetchCurrentUser()
      const session = await api.fetchSession()
      setAuthState({
        isAuthenticated: !!session.tokens,
        isLoading: false,
        user: { username: user.username },
      })
    } catch {
      setAuthState({ isAuthenticated: false, isLoading: false, user: null })
    }
  }

  async function login(redirectTo?: string) {
    await api.signIn(redirectTo)
  }

  async function logout() {
    await api.logOut()
  }

  return { ...authState, login, logout, checkAuth }
}
