import { Workspace } from '../../schemas/workspace.schema'
import { CreateWorkspaceDto } from '../dto/CreateWorkspaceDto'
import { CreateWorkspaceResponseDto } from '../dto/CreateWorkspaceResponseDto'

export interface IWorkspaceManagerService {
  createWorkspace(dto: CreateWorkspaceDto, authenticatedUsername: string, authenticatedSub: string): Promise<CreateWorkspaceResponseDto> 
  deleteWorkspace(id: string): Promise<void>
}