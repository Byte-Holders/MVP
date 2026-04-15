import { apiGet, ApiError } from '../../../api/apiClient'
import type { IGetBranchesRepository } from '../interfaces/model/IGetBranchesRepository'

class GetBranchesRepository implements IGetBranchesRepository {
  async getBranches(repositoryId: string): Promise<string[]> {
    try {
      return await apiGet<string[]>(`/api/repositories/${repositoryId}/branches`)
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
        return []
      }
      throw err
    }
  }
}

export const getBranchesRepository: IGetBranchesRepository = new GetBranchesRepository()
