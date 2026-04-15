import type { CreateWorkspaceRequest } from '../../types/CreateWorkspace'
import type { WorkspaceResponse } from '../../types/CreateWorkspaceResponse'

export interface ICreateWorkspaceRepository {
  createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceResponse>
}
