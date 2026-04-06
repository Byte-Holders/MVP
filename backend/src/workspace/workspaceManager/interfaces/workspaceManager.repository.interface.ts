import { Workspace, WorkspaceDocument } from '../../schemas/workspace.schema'
import { CreateWorkspaceDto } from '../dto/CreateWorkspaceDto'

export interface IWorkspaceManagerRepository {
  create(dto: CreateWorkspaceDto, authenticatedSub: string): Promise<WorkspaceDocument>
  delete(id: string): Promise<void>
}