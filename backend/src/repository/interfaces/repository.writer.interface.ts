export interface IRepositoryWriter {
  addRepository(repositoryUrl: string, accessToken?: string): Promise<string>;
  updateToken(repositoryId: string, accessToken: string): Promise<void>;
}

export const RepositoryWriterToken = 'REPOSITORY_WRITER';
