export interface IRemoveMemberRepository {
  removeMember(workspaceId: string, userId: string): Promise<void>
}
