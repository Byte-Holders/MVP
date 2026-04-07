export interface IRepositoryWriter {
  addRepository(repositoryUrl: string, accessToken?: string): Promise<string>;
}

export const RepositoryWriterToken = 'REPOSITORY_WRITER';
