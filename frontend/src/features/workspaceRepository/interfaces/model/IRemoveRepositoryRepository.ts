export interface IRemoveRepositoryRepository {
  removeRepository(workspaceId: string, repoId: string): Promise<void>
}
