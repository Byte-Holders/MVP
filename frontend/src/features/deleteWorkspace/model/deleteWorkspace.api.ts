import { apiDelete } from '@/api/apiClient'
import type { IDeleteWorkspaceRepository } from '../interfaces/model/IDeleteWorkspaceRepository'

class DeleteWorkspaceRepository implements IDeleteWorkspaceRepository {
  async deleteWorkspace(data: { workspaceId: string }): Promise<void> {
    return apiDelete(`/api/workspaces/${data.workspaceId}`)
  }
}

export const deleteWorkspaceRepository: IDeleteWorkspaceRepository =
  new DeleteWorkspaceRepository()
