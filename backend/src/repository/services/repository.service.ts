import { Inject, Injectable } from '@nestjs/common';
import type { IRepositoryService } from '../interfaces/repository.service.interface';
import type { IRepositoryFindRepository } from '../interfaces/repository.find-repository.interface';
import { RepositoryFindRepositoryToken } from '../interfaces/repository.find-repository.interface';
import type { IGitHubRepository } from '../interfaces/github.repository.interface';
import { GitHubRepositoryToken } from '../interfaces/github.repository.interface';
import type { RepositoryInfo } from '../types/repository-info';
import type { RepositoryEntity } from '../entities/repository.entity';

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
    return this.toInfo(entity);
  }

  private toInfo(entity: RepositoryEntity): RepositoryInfo {
    return {
      repositoryId: entity.repositoryId,
      ownerName: entity.ownerName,
      name: entity.name,
      dateScan: entity.dateScan?.toISOString(),
      documentationScore: entity.documentationScore,
      codeCoverage: entity.codeCoverage,
      cvss: entity.cvss,
    };
  }

  async getBranches(repositoryId: string): Promise<string[]> {
    const entity = await this.repositoryRepository.getRepository(repositoryId);
    return this.gitHubRepository.getBranches(entity.ownerName, entity.name);
  }
}
