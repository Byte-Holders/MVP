import { Inject, Injectable } from '@nestjs/common';
import type { IRepositoryService } from '../interfaces/repository.service.interface';
import type { IRepositoryReader } from '../interfaces/repository.reader.interface';
import type { IRepositoryWriter } from '../interfaces/repository.writer.interface';
import type { IRepositoryRepository } from '../interfaces/repository.repository.interface';
import { RepositoryRepositoryToken } from '../interfaces/repository.repository.interface';
import type { IGitHubRepository } from '../interfaces/github.repository.interface';
import { GitHubRepositoryToken } from '../interfaces/github.repository.interface';
import type { RepositoryEntity } from '../entities/repository.entity';
import type { RepositoryInfo } from '../types/repository-info';

@Injectable()
export class RepositoryService
  implements IRepositoryService, IRepositoryReader, IRepositoryWriter
{
  constructor(
    @Inject(RepositoryRepositoryToken)
    private repositoryRepository: IRepositoryRepository,
    @Inject(GitHubRepositoryToken)
    private gitHubRepository: IGitHubRepository,
  ) {}

  async getRepository(repositoryId: string): Promise<RepositoryInfo> {
    const entity = await this.repositoryRepository.getRepository(repositoryId);
    return this.toRepositoryInfo(entity);
  }

  async getBranches(repositoryId: string): Promise<string[]> {
    const entity = await this.repositoryRepository.getRepository(repositoryId);
    return this.gitHubRepository.getBranches(entity.ownerName, entity.name);
  }

  async getRepositories(
    repositoryIds: string[],
    searchInput?: string,
  ): Promise<RepositoryInfo[]> {
    const entities = await this.repositoryRepository.getRepositories(
      repositoryIds,
      searchInput,
    );
    return entities.map((e) => this.toRepositoryInfo(e));
  }

  async addRepository(
    repositoryUrl: string,
    accessToken?: string,
  ): Promise<string> {
    if (accessToken) {
      const [ownerName, name] = repositoryUrl
        .replace(/https?:\/\/github\.com\//, '')
        .split('/');
      await this.gitHubRepository.verifyAccess(ownerName, name, accessToken);
    }
    return this.repositoryRepository.addRepository(repositoryUrl, accessToken);
  }

  async updateToken(repositoryId: string, accessToken: string): Promise<void> {
    const entity = await this.repositoryRepository.getRepository(repositoryId);
    await this.gitHubRepository.verifyAccess(entity.ownerName, entity.name, accessToken);
    return this.repositoryRepository.updateToken(repositoryId, accessToken);
  }

  toRepositoryInfo(entity: RepositoryEntity): RepositoryInfo {
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
}
