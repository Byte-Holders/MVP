export interface IGitHubBranchesRepository {
  getBranches(
    ownerName: string,
    name: string,
    accessToken?: string,
  ): Promise<string[]>;
}

export const GitHubBranchesRepositoryToken = 'GITHUB_BRANCHES_REPOSITORY';
