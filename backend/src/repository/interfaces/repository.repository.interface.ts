import type { RepositoryEntity } from '../entities/repository.entity';

export interface IRepositoryRepository {
  getRepositories(
    repositoryIds: string[],
    searchInput?: string,
  ): Promise<RepositoryEntity[]>;
  getRepository(repositoryId: string): Promise<RepositoryEntity>;
  addRepository(repositoryUrl: string, accessToken?: string): Promise<string>;
  updateToken(repositoryId: string, accessToken: string): Promise<void>;
}

export const RepositoryRepositoryToken = 'REPOSITORY_REPOSITORY';
