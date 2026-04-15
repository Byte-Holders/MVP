import { fetchSession } from './authApi'
import type { IAuthRepository } from '../interfaces/repository/IAuthRepository'

class AuthRepository implements IAuthRepository {
  // Uses idToken (not accessToken) because the registration endpoint
  // needs identity claims (sub, username) that are only present in idToken.
  async register(): Promise<void> {
    const session = await fetchSession()
    const idToken = session.tokens?.idToken?.toString()

    const response = await fetch('/api/user/register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    })

    // 409 = user already registered, not an error
    if (!response.ok && response.status !== 409) {
      throw new Error('Errore durante la registrazione utente')
    }
  }
}

export const authRepository: IAuthRepository = new AuthRepository()
