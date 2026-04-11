import { Inject, Injectable } from '@nestjs/common';
import type { IRepositoryReader } from '../interfaces/repository.reader.interface';
import type { IRepositoryFindRepository } from '../interfaces/repository.find-repository.interface';
import { RepositoryFindRepositoryToken } from '../interfaces/repository.find-repository.interface';
import type { RepositoryInfo } from '../types/repository-info';
import { RepositoryMapper } from '../mappers/repository.mapper';

@Injectable()
export class RepositoryReaderService implements IRepositoryReader {
  constructor(
    @Inject(RepositoryFindRepositoryToken)
    private readonly repositoryRepository: IRepositoryFindRepository,
  ) {}

  async getRepositories(
    repositoryIds: string[],
    searchInput?: string,
  ): Promise<RepositoryInfo[]> {
    const entities = await this.repositoryRepository.getRepositories(
      repositoryIds,
      searchInput,
    );
    return entities.map(RepositoryMapper.toInfo);
  }
}
