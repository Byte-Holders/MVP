export interface IGetBranchesRepository {
  getBranches(repositoryId: string): Promise<string[]>
}
