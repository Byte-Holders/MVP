import { apiPost } from '../../../api/apiClient'
import type { IAddRepositoryRepository } from '../interfaces/model/IAddRepositoryRepository'
import type { AddRepositoryRequest } from '../types/repository'

class AddRepositoryRepository implements IAddRepositoryRepository {
  async addRepository(
    workspaceId: string,
    data: AddRepositoryRequest,
  ): Promise<void> {
    return apiPost(`/api/workspaces/${workspaceId}/repositories`, data)
  }
}

export const addRepositoryRepository: IAddRepositoryRepository =
  new AddRepositoryRepository()
