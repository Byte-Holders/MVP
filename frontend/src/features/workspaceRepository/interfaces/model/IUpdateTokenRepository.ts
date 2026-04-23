export interface IUpdateTokenRepository {
  updateToken(
    workspaceId: string,
    repositoryId: string,
    accessToken: string,
  ): Promise<void>
}
