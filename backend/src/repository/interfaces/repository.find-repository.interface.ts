import type { RepositoryEntity } from '../entities/repository.entity';

export interface IRepositoryFindRepository {
  getRepository(repositoryId: string): Promise<RepositoryEntity>;
  getRepositories(
    repositoryIds: string[],
    searchInput?: string,
  ): Promise<RepositoryEntity[]>;
}

export const RepositoryFindRepositoryToken = 'REPOSITORY_FIND_REPOSITORY';
