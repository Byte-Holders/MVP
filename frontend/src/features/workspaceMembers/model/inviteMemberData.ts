import { apiPost } from '../../../api/apiClient'
import type { IInviteMemberRepository } from '../interfaces/model/IInviteMemberRepository'
import type { WorkspaceRole } from '../types/workspaceMember'

class InviteMemberRepository implements IInviteMemberRepository {
  async inviteMember(
    workspaceId: string,
    recipientUsername: string,
    recipientRole: WorkspaceRole,
  ): Promise<void> {
    return apiPost('/api/invitations', {
      workspaceId,
      recipientUsername,
      recipientRole,
    })
  }
}

export const inviteMemberRepository: IInviteMemberRepository =
  new InviteMemberRepository()
