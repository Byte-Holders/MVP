import type { RepositoryInfo } from '../dtos/RepositoryInfo';

export interface IRepositoryService {
  getRepository(repositoryId: string): Promise<RepositoryInfo>;
  getBranches(repositoryId: string): Promise<string[]>;
}

export const RepositoryServiceToken = 'REPOSITORY_SERVICE';
