import { useState, useEffect } from 'react'
import { fetchCurrentUser, fetchSession, signIn, logOut } from '../model/authApi'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: { username: string } | null
}

export function useAuth() {
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
      const user = await fetchCurrentUser()
      const session = await fetchSession()
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
    await signIn(redirectTo)
  }

  async function logout() {
    await logOut()
    setAuthState({ isAuthenticated: false, isLoading: false, user: null })
  }

  return { ...authState, login, logout, checkAuth }
}
