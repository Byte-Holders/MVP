import type { AccessTokenDto } from '../dtos/AccessTokenDto';
import type { AddRepositoryDto } from '../../../repository/dtos/AddRepositoryDto';
import type { RepositoryInfo } from '../../../repository/dtos/RepositoryInfo';

export interface IWorkspaceRepositoryService {
  getRepositories(workspaceId: string, searchInput?: string): Promise<RepositoryInfo[]>;
  addRepository(workspaceId: string, dto: AddRepositoryDto): Promise<void>;
  removeRepository(repositoryId: string, workspaceId: string): Promise<void>;
  updateToken(
    repositoryId: string,
    workspaceId: string,
    dto: AccessTokenDto,
  ): Promise<void>;
}

export const WorkspaceRepositoryServiceToken = 'WORKSPACE_REPOSITORY_SERVICE';
