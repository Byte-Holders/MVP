import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { fetchCurrentUser } from '../model/authApi'
import { useRegister } from './useRegister'

export function useCallbackPage() {
  const navigate = useNavigate()
  const { register } = useRegister()

  useEffect(() => {
    async function handleCallback() {
      try {
        await fetchCurrentUser()
        await register()

        const redirectTo = sessionStorage.getItem('auth_redirect')
        sessionStorage.removeItem('auth_redirect')

        navigate({ to: redirectTo || '/workspaces', replace: true })
      } catch (err) {
        console.error('Callback error:', err)
        navigate({ to: '/', replace: true })
      }
    }

    handleCallback()
  }, [navigate])
}
