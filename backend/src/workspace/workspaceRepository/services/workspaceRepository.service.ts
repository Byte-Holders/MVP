import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { RepositoryResponseDto } from '../dtos/RepositoryResponseDto';
import type { IWorkspaceRepositoryService } from '../interfaces/workspaceRepository.service.interface';
import type { AddRepositoryDto } from '../dtos/AddRepositoryDto';
import type { GetRepositoriesDto } from '../dtos/GetRepositoriesDto';
import type { AccessTokenDto } from '../dtos/AccessTokenDto';
import type { WorkspaceRepoParamsDto } from '../dtos/WorkspaceRepoParamsDto';
import type { IWorkspaceRepository } from '../interfaces/workspaceRepository.repository.interface';
import { WorkspaceRepositoryToken } from '../interfaces/workspaceRepository.repository.interface';
import { RepositoryRepository } from '../../../repository/repository.repository';

@Injectable()
export class WorkspaceRepositoryService implements IWorkspaceRepositoryService {
  constructor(
    @Inject(WorkspaceRepositoryToken)
    private workspaceRepository: IWorkspaceRepository,
    private repositoryRepository: RepositoryRepository,
  ) {}

  async getRepositories(
    dto: GetRepositoriesDto,
  ): Promise<RepositoryResponseDto[]> {
    return this.workspaceRepository.getRepositories(dto.workspaceId);
  }

  async addRepository(dto: AddRepositoryDto): Promise<void> {
    const urlParts = dto.repositoryUrl
      .replace(/https?:\/\/github\.com\//, '')
      .split('/');

    const [ownerName, repoName] = urlParts;

    if (dto.accessToken) {
      const response = await fetch(
        `https://api.github.com/repos/${ownerName}/${repoName}`,
        {
          headers: {
            Authorization: `Bearer ${dto.accessToken}`,
            Accept: 'application/vnd.github+json',
          },
        },
      );
      if (response.status === 401) {
        throw new UnauthorizedException('Il token di accesso non è valido');
      }
      if (response.status === 404) {
        throw new UnauthorizedException(
          'Il token non ha accesso a questo repository',
        );
      }
    }

    const repository = await this.repositoryRepository.findOrCreate(
      ownerName,
      repoName,
    );

    return this.workspaceRepository.addRepository(
      dto.workspaceId,
      repository._id.toString(),
      dto.accessToken,
    );
  }

  async removeRepository(params: WorkspaceRepoParamsDto): Promise<void> {
    return this.workspaceRepository.removeRepository(
      params.workspaceId,
      params.repoId,
    );
  }

  async updateToken(
    params: WorkspaceRepoParamsDto,
    dto: AccessTokenDto,
  ): Promise<void> {
    // TODO: implementare la logica per aggiornare il token di un repository
    console.log('updateToken', params, dto);
  }
}
