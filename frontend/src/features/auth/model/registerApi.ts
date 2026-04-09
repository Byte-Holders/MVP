import { fetchSession } from './authApi'

export async function registerUser(): Promise<void> {
  const session = await fetchSession()
  const idToken = session.tokens?.idToken?.toString()

  const response = await fetch('/api/user/register', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  })

  // 409 o simili = utente già registrato, non è un errore
  if (!response.ok && response.status !== 409) {
    throw new Error('Errore durante la registrazione utente')
  }
}
