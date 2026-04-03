import type { RepositoryResponseDto } from '../dtos/RepositoryResponseDto';

export interface IWorkspaceRepository {
  getRepositories(workspaceId: string): Promise<RepositoryResponseDto[]>;
  addRepository(workspaceId: string, repositoryId: string, gitHubUserToken?: string): Promise<void>;
  removeRepository(workspaceId: string, repoId: string): Promise<void>;
}

export const WorkspaceRepositoryToken = 'WORKSPACE_REPOSITORY';
