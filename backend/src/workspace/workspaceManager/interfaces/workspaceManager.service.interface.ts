import { Workspace } from '../../schemas/workspace.schema'
import { CreateWorkspaceDto } from '../dto/CreateWorkspaceDto'

export interface IWorkspaceManagerService {
  createWorkspace(dto: CreateWorkspaceDto, authenticatedUsername: string): Promise<Workspace>
}