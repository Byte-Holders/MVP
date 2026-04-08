import type { RepositoryInfo } from '../../../repository/types/repository-info';

export interface IWorkspaceRepositoryService {
  getRepositories(workspaceId: string, searchInput?: string): Promise<RepositoryInfo[]>;
  addRepository(workspaceId: string, repositoryUrl: string, accessToken?: string): Promise<void>;
  removeRepository(repositoryId: string, workspaceId: string): Promise<void>;
  updateToken(repositoryId: string, workspaceId: string, accessToken: string): Promise<void>;
}

export const WorkspaceRepositoryServiceToken = 'WORKSPACE_REPOSITORY_SERVICE';
