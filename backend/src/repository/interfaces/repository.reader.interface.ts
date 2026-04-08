import type { RepositoryInfo } from '../types/repository-info';

export interface IRepositoryReader {
  getRepositories(repositoryIds: string[], searchInput?: string): Promise<RepositoryInfo[]>;
}

export const RepositoryReaderToken = 'REPOSITORY_READER';
