import { useEffect } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuthContext } from '../hooks/useAuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, login } = useAuthContext()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login(currentPath) // salva il path e reindirizza a Cognito
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) return <div>Caricamento...</div>
  if (!isAuthenticated) return null

  return <>{children}</>
}
