import { apiDelete } from '../../../api/apiClient'
import type { IRemoveRepositoryRepository } from '../interfaces/model/IRemoveRepositoryRepository'

class RemoveRepositoryRepository implements IRemoveRepositoryRepository {
  async removeRepository(workspaceId: string, repoId: string): Promise<void> {
    return apiDelete(`/api/workspaces/${workspaceId}/repositories/${repoId}`)
  }
}

export const removeRepositoryRepository: IRemoveRepositoryRepository = new RemoveRepositoryRepository()
