import { apiPost } from '../../../api/apiClient'
import type { ICreateWorkspaceRepository } from '../interfaces/model/ICreateWorkspaceRepository'
import type { CreateWorkspaceRequest } from '../types/CreateWorkspace'
import type { WorkspaceResponse } from '../types/CreateWorkspaceResponse'

class CreateWorkspaceRepository implements ICreateWorkspaceRepository {
  async createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
    return apiPost<WorkspaceResponse>('/api/workspaces/', data)
  }
}

export const createWorkspaceRepository: ICreateWorkspaceRepository =
  new CreateWorkspaceRepository()
