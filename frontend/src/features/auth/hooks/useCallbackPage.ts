import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '../model/authApi'
import type { IAuthApi } from '../interfaces/model/IAuthApi'
import type { ICallbackPageViewModel } from '../interfaces/viewModel/IUseCallbackPage'
import { useRegister } from './useRegister'

export function useCallbackPage(
  api: IAuthApi = authApi,
): ICallbackPageViewModel {
  const navigate = useNavigate()
  const { register } = useRegister()

  useEffect(() => {
    async function handleCallback() {
      try {
        await api.fetchCurrentUser()
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
          await api.removeCurrentUser()
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
        })
      }
    }

    handleCallback()
  }, [navigate])

  return {}
}
