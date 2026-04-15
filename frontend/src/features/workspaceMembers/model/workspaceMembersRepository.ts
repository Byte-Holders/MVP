import { apiGet, apiPost, apiDelete } from '../../../api/apiClient'
import type { IWorkspaceMembersRepository } from '../interfaces/repository/IWorkspaceMembersRepository'
import type { WorkspaceMember, WorkspaceRole } from '../types/workspaceMember'

class WorkspaceMembersRepository implements IWorkspaceMembersRepository {
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return apiGet<WorkspaceMember[]>(`/api/workspace/${workspaceId}/users`)
  }

  async inviteMember(
    workspaceId: string,
    recipientUsername: string,
    recipientRole: WorkspaceRole,
  ): Promise<void> {
    return apiPost('/api/membership/invite', {
      workspaceId,
      recipientUsername,
      recipientRole,
    })
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    return apiDelete(`/api/workspace/${workspaceId}/users/${userId}`)
  }
}

export const workspaceMembersRepository: IWorkspaceMembersRepository =
  new WorkspaceMembersRepository()
