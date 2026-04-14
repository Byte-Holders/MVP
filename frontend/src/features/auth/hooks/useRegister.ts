import { registerUser } from '../model/registerApi'
import type { IRegisterViewModel } from '../types/viewModels'

export function useRegister(): IRegisterViewModel {
  async function register(): Promise<void> {
    await registerUser()
  }

  return { register }
}
