export interface IWorkspaceRepositoryRepository {
  getRepositories(workspaceId: string): Promise<string[]>;
  addRepository(workspaceId: string, repositoryId: string): Promise<void>;
  removeRepository(repositoryId: string, workspaceId: string): Promise<void>;
}

export const WorkspaceRepositoryToken = 'WORKSPACE_REPOSITORY';
