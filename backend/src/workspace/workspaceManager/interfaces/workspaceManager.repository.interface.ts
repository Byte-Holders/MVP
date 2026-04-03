import { Workspace } from '../../schemas/workspace.schema'
import { CreateWorkspaceDto } from '../dto/CreateWorkspaceDto'

export interface IWorkspaceManagerRepository {
  create(dto: CreateWorkspaceDto): Promise<Workspace>
}