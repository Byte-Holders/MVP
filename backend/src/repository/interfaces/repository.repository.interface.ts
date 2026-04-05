import type { AddRepositoryDto } from '../dtos/AddRepositoryDto';
import type { RepositoryInfo } from '../dtos/RepositoryInfo';

export interface IRepositoryRepository {
  getRepositories(repositoryIds: string[], searchInput?: string): Promise<RepositoryInfo[]>;
  getRepository(repositoryId: string): Promise<RepositoryInfo>;
  getBranches(repositoryId: string): Promise<string[]>;
  addRepository(dto: AddRepositoryDto): Promise<string>;
}

export const RepositoryRepositoryToken = 'REPOSITORY_REPOSITORY';
