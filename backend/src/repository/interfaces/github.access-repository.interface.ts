export interface IGitHubAccessRepository {
  verifyAccess(
    ownerName: string,
    name: string,
    accessToken: string,
  ): Promise<void>;
}

export const GitHubAccessRepositoryToken = 'GITHUB_ACCESS_REPOSITORY';
