import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getCurrentUser } from 'aws-amplify/auth'
import { useRegister } from '../hooks/useRegister'

export function CallbackPage() {
  const navigate = useNavigate()
  const { register } = useRegister()

  useEffect(() => {
    async function handleCallback() {
      try {
        await getCurrentUser()
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

  return <div>Accesso in corso...</div>
}
