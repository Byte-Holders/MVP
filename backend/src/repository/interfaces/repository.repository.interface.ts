import type { RepositoryEntity } from '../entities/repository.entity';

export interface IRepositoryRepository {
  getRepositories(
    repositoryIds: string[],
    searchInput?: string,
  ): Promise<RepositoryEntity[]>;
  getRepository(repositoryId: string): Promise<RepositoryEntity>;
  addRepository(repositoryUrl: string, accessToken?: string): Promise<string>;
}

export const RepositoryRepositoryToken = 'REPOSITORY_REPOSITORY';
