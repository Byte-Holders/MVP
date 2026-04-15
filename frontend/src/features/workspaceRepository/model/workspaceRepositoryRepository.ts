import { apiGet, apiPost, apiDelete } from '../../../api/apiClient'
import type { IWorkspaceRepositoryRepository } from '../interfaces/repository/IWorkspaceRepositoryRepository'
import type {
  RepositoryInWorkspace,
  AddRepositoryRequest,
} from '../types/repository'

class WorkspaceRepositoryRepository implements IWorkspaceRepositoryRepository {
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

  async addRepository(
    workspaceId: string,
    data: AddRepositoryRequest,
  ): Promise<void> {
    return apiPost(`/api/workspaces/${workspaceId}/repositories`, data)
  }

  async removeRepository(workspaceId: string, repoId: string): Promise<void> {
    return apiDelete(`/api/workspaces/${workspaceId}/repositories/${repoId}`)
  }
}

export const workspaceRepositoryRepository: IWorkspaceRepositoryRepository =
  new WorkspaceRepositoryRepository()
