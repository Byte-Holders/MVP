export interface IGitHubRepository {
  getBranches(ownerName: string, name: string, accessToken?: string): Promise<string[]>;
  verifyAccess(ownerName: string, name: string, accessToken: string): Promise<void>;
}

export const GitHubRepositoryToken = 'GITHUB_REPOSITORY';
