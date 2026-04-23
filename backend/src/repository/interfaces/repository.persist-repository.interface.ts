export interface IRepositoryPersistRepository {
  addRepository(
    ownerName: string,
    name: string,
    accessToken?: string,
  ): Promise<string>;
  updateToken(repositoryId: string, accessToken: string): Promise<void>;
}

export const RepositoryPersistRepositoryToken = 'REPOSITORY_PERSIST_REPOSITORY';
