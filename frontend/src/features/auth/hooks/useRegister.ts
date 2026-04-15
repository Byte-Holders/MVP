import { authRepository } from '../model/registerApi'
import type { IAuthRepository } from '../interfaces/model/IAuthRepository'
import type { IRegisterViewModel } from '../interfaces/viewModel/IUseRegister'

export function useRegister(
  repo: IAuthRepository = authRepository,
): IRegisterViewModel {
  async function register(): Promise<void> {
    await repo.register()
  }

  return { register }
}
