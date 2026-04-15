import { registerUser } from '../model/registerApi'
import type { IRegisterViewModel } from '../interfaces/IUseRegister'

export function useRegister(): IRegisterViewModel {
  async function register(): Promise<void> {
    await registerUser()
  }

  return { register }
}
