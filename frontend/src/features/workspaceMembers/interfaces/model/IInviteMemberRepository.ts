import type { WorkspaceRole } from '../../types/workspaceMember'

export interface IInviteMemberRepository {
  inviteMember(
    workspaceId: string,
    recipientUsername: string,
    recipientRole: WorkspaceRole,
  ): Promise<void>
}
