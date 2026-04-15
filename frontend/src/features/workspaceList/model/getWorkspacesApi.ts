import { apiGet } from '../../../api/apiClient'
import type { IWorkspaceListRepository } from '../interfaces/model/IWorkspaceListRepository'
import type { WorkspaceListItem } from '../types/Workspace'

class WorkspaceListRepository implements IWorkspaceListRepository {
  async getWorkspaces(): Promise<WorkspaceListItem[]> {
    return apiGet<WorkspaceListItem[]>('/api/workspaces')
  }
}

export const workspaceListRepository: IWorkspaceListRepository =
  new WorkspaceListRepository()
