import type { WorkspaceMember, WorkspaceRole } from '../../types/workspaceMember'

export interface IWorkspaceMembersRepository {
  getMembers(workspaceId: string): Promise<WorkspaceMember[]>
  inviteMember(
    workspaceId: string,
    recipientUsername: string,
    recipientRole: WorkspaceRole,
  ): Promise<void>
  removeMember(workspaceId: string, userId: string): Promise<void>
}
