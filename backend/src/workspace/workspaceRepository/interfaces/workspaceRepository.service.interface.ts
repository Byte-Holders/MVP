import type { RepositoryResponseDto } from '../dtos/RepositoryResponseDto';
import type { AddRepositoryDto } from '../dtos/AddRepositoryDto';
import type { GetRepositoriesDto } from '../dtos/GetRepositoriesDto';
import type { AccessTokenDto } from '../dtos/AccessTokenDto';
import type { WorkspaceRepoParamsDto } from '../dtos/WorkspaceRepoParamsDto';

export interface IWorkspaceRepositoryService {
  getRepositories(dto: GetRepositoriesDto): Promise<RepositoryResponseDto[]>;
  addRepository(dto: AddRepositoryDto): Promise<void>;
  removeRepository(params: WorkspaceRepoParamsDto): Promise<void>;
  updateToken(params: WorkspaceRepoParamsDto, dto: AccessTokenDto): Promise<void>;
}

export const WorkspaceRepositoryServiceToken = 'WORKSPACE_REPOSITORY_SERVICE';
