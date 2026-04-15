import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { fetchCurrentUser, removeCurrentUser } from '../model/authApi'
import { useRegister } from '../hooks/useRegister'

export function CallbackPage() {
  const navigate = useNavigate()
  const { register } = useRegister()

  useEffect(() => {
    async function handleCallback() {
      try {
        await fetchCurrentUser()
      } catch {
        // Cognito stesso ha fallito — nessun utente da cancellare
        navigate({ to: '/', replace: true })
        return
      }

      try {
        await register()
        const redirectTo = sessionStorage.getItem('auth_redirect')
        sessionStorage.removeItem('auth_redirect')
        navigate({ to: redirectTo || '/workspaces', replace: true })
      } catch (err) {
        // Cognito ok ma DB fallito — cancella l'utente da Cognito
        try {
          await removeCurrentUser()
        } catch (deleteErr) {
          console.error(
            'Errore durante la cancellazione utente Cognito:',
            deleteErr,
          )
        }
        navigate({
          to: '/',
          search: { error: 'registration_failed' },
          replace: true,
        }) //da sviluppare visualizzazzione dell'erreo in homepage
      }
    }

    handleCallback()
  }, [navigate])

  return <div>Accesso in corso...</div>
}
