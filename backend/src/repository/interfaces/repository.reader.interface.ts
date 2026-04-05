import type { RepositoryInfo } from '../dtos/RepositoryInfo';

export interface IRepositoryReader {
  getRepositories(repositoryIds: string[], searchInput?: string): Promise<RepositoryInfo[]>;
}

export const RepositoryReaderToken = 'REPOSITORY_READER';
