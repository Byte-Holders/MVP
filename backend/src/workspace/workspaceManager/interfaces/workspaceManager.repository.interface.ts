import { CreateWorkspaceDto } from '../dto/CreateWorkspaceDto'
import { HydratedDocument } from 'mongoose'
import { Workspace } from '../../schemas/workspace.schema'
import { CreateWorkspaceData } from '../document/CreateWorkspaceData'

export interface IWorkspaceManagerRepository {
  create(data: CreateWorkspaceData): Promise<HydratedDocument<Workspace>>
  delete(id: string): Promise<void>
  findById(workspaceId: string): Promise<HydratedDocument<Workspace> | null>  
  findByMemberId(userId: string): Promise<HydratedDocument<Workspace>[]> 
}