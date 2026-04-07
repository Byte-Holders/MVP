import type { RepositoryInfo } from '../types/repository-info';

export interface IRepositoryRepository {
  getRepositories(repositoryIds: string[], searchInput?: string): Promise<RepositoryInfo[]>;
  getRepository(repositoryId: string): Promise<RepositoryInfo>;
  getBranches(repositoryId: string): Promise<string[]>;
  addRepository(repositoryUrl: string, accessToken?: string): Promise<string>;
}

export const RepositoryRepositoryToken = 'REPOSITORY_REPOSITORY';
