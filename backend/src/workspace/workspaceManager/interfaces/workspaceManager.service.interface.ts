import { RequestUser } from 'src/auth/types/requestUser.type'
import { Workspace } from '../../schemas/workspace.schema'
import { CreateWorkspaceDto } from '../dto/CreateWorkspaceDto'
import { CreateWorkspaceResponseDto } from '../dto/CreateWorkspaceResponseDto'
import { CreateWorkspaceBo } from '../bo/CreateWorkspaceBo'
import { WorkspaceBo } from '../bo/WorkspaceBo'
import { WorkspaceListItemBo } from '../bo/WorkspaceListItemBo'

export interface IWorkspaceManagerService {
  createWorkspace(data: CreateWorkspaceBo): Promise<WorkspaceBo> 
  deleteWorkspace(id: string, authenticatedSub: string): Promise<void>
  getWorkspaces(userId: string): Promise<WorkspaceListItemBo[]>
}