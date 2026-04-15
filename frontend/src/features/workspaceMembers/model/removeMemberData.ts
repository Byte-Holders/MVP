import { apiDelete } from '../../../api/apiClient'
import type { IRemoveMemberRepository } from '../interfaces/model/IRemoveMemberRepository'

class RemoveMemberRepository implements IRemoveMemberRepository {
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    return apiDelete(`/api/workspace/${workspaceId}/users/${userId}`)
  }
}

export const removeMemberRepository: IRemoveMemberRepository =
  new RemoveMemberRepository()
