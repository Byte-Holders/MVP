import { apiGet } from '../../../api/apiClient'
import type { IGetMembersRepository } from '../interfaces/model/IGetMembersRepository'
import type { WorkspaceMember } from '../types/workspaceMember'

class GetMembersRepository implements IGetMembersRepository {
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return apiGet<WorkspaceMember[]>(`/api/workspace/${workspaceId}/users`)
  }
}

export const getMembersRepository: IGetMembersRepository =
  new GetMembersRepository()
