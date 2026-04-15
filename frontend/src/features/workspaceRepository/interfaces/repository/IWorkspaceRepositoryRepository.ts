import type {
  RepositoryInWorkspace,
  AddRepositoryRequest,
} from '../../types/repository'

export interface IWorkspaceRepositoryRepository {
  getRepositories(
    workspaceId: string,
    searchInput?: string,
  ): Promise<RepositoryInWorkspace[]>
  addRepository(
    workspaceId: string,
    data: AddRepositoryRequest,
  ): Promise<void>
  removeRepository(workspaceId: string, repoId: string): Promise<void>
}
