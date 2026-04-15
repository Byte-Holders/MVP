import type { RepositoryInWorkspace } from '../../types/repository'

export interface IGetRepositoriesRepository {
  getRepositories(
    workspaceId: string,
    searchInput?: string,
  ): Promise<RepositoryInWorkspace[]>
}
