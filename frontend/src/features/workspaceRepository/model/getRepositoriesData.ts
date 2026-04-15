import { apiGet } from '../../../api/apiClient'
import type { IGetRepositoriesRepository } from '../interfaces/model/IGetRepositoriesRepository'
import type { RepositoryInWorkspace } from '../types/repository'

class GetRepositoriesRepository implements IGetRepositoriesRepository {
  async getRepositories(
    workspaceId: string,
    searchInput?: string,
  ): Promise<RepositoryInWorkspace[]> {
    const query = searchInput
      ? `?searchInput=${encodeURIComponent(searchInput)}`
      : ''
    return apiGet<RepositoryInWorkspace[]>(
      `/api/workspaces/${workspaceId}/repositories${query}`,
    )
  }
}

export const getRepositoriesRepository: IGetRepositoriesRepository = new GetRepositoriesRepository()
