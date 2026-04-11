import { Inject, Injectable } from '@nestjs/common';
import type { IRepositoryService } from '../interfaces/repository.service.interface';
import type { IRepositoryFindRepository } from '../interfaces/repository.find-repository.interface';
import { RepositoryFindRepositoryToken } from '../interfaces/repository.find-repository.interface';
import type { IGitHubRepository } from '../interfaces/github.repository.interface';
import { GitHubRepositoryToken } from '../interfaces/github.repository.interface';
import type { RepositoryInfo } from '../types/repository-info';
import { RepositoryMapper } from '../mappers/repository.mapper';

@Injectable()
export class RepositoryService implements IRepositoryService {
  constructor(
    @Inject(RepositoryFindRepositoryToken)
    private readonly repositoryRepository: IRepositoryFindRepository,
    @Inject(GitHubRepositoryToken)
    private readonly gitHubRepository: IGitHubRepository,
  ) {}

  async getRepository(repositoryId: string): Promise<RepositoryInfo> {
    const entity = await this.repositoryRepository.getRepository(repositoryId);
    return RepositoryMapper.toInfo(entity);
  }

  async getBranches(repositoryId: string): Promise<string[]> {
    const entity = await this.repositoryRepository.getRepository(repositoryId);
    return this.gitHubRepository.getBranches(entity.ownerName, entity.name);
  }
}
