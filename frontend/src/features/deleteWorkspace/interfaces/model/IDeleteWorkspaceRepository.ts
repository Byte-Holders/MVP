export interface IDeleteWorkspaceRepository {
  deleteWorkspace(data: { workspaceId: string }): Promise<void>
}
