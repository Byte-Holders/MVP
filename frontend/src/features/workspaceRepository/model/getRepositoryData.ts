import { apiGet } from '../../../api/apiClient'
import type { RepositoryInWorkspace } from '../types/repository'

class GetRepositoryRepository {
  async getRepository(repositoryId: string): Promise<RepositoryInWorkspace> {
    return apiGet<RepositoryInWorkspace>(`/api/repositories/${repositoryId}`)
  }
}

export const getRepositoryRepository = new GetRepositoryRepository()
