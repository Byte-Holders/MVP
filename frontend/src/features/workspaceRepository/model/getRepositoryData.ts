import { apiGet } from '../../../api/apiClient'
import type { RepositoryInWorkspace } from '../types/repository'
import type { IGetRepositoryRepository } from '../interfaces/model/IGetRepositoryRepository'

class GetRepositoryRepository implements IGetRepositoryRepository {
  async getRepository(repositoryId: string): Promise<RepositoryInWorkspace> {
    return apiGet<RepositoryInWorkspace>(`/api/repositories/${repositoryId}`)
  }
}

export const getRepositoryRepository: IGetRepositoryRepository =
  new GetRepositoryRepository()
