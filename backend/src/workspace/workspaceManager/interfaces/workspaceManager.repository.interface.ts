import { Workspace } from '../../schemas/workspace.schema'
import { CreateWorkspaceDto } from '../dto/CreateWorkspaceDto'

export interface IWorkspaceManagerRepository {
  create(dto: CreateWorkspaceDto, authenticatedUsername: string): Promise<Workspace>
  delete(id: string): Promise<void>
}