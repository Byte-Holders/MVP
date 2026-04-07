import { Inject, Injectable } from '@nestjs/common';
import type { IRepositoryService } from '../interfaces/repository.service.interface';
import type { IRepositoryReader } from '../interfaces/repository.reader.interface';
import type { IRepositoryWriter } from '../interfaces/repository.writer.interface';
import type { IRepositoryRepository } from '../interfaces/repository.repository.interface';
import { RepositoryRepositoryToken } from '../interfaces/repository.repository.interface';
import type { RepositoryInfo } from '../types/repository-info';

@Injectable()
export class RepositoryService implements IRepositoryService, IRepositoryReader, IRepositoryWriter {
  constructor(
    @Inject(RepositoryRepositoryToken)
    private repositoryRepository: IRepositoryRepository,
  ) {}

  async getRepository(repositoryId: string): Promise<RepositoryInfo> {
    return this.repositoryRepository.getRepository(repositoryId);
  }

  async getBranches(repositoryId: string): Promise<string[]> {
    return this.repositoryRepository.getBranches(repositoryId);
  }

  async getRepositories(repositoryIds: string[], searchInput?: string): Promise<RepositoryInfo[]> {
    return this.repositoryRepository.getRepositories(repositoryIds, searchInput);
  }

  async addRepository(repositoryUrl: string, accessToken?: string): Promise<string> {
    return this.repositoryRepository.addRepository(repositoryUrl, accessToken);
  }
}
