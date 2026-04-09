import { registerUser } from '../model/registerApi'

export function useRegister() {
  async function register(): Promise<void> {
    await registerUser()
  }

  return { register }
}
