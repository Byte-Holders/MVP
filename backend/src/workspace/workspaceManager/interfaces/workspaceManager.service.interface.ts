import { RequestUser } from '../../../auth/types/requestUser.type';
import { Workspace } from '../../schemas/workspace.schema';
import { CreateWorkspaceDto } from '../dtos/CreateWorkspaceDto';
import { CreateWorkspaceResponseDto } from '../dtos/CreateWorkspaceResponseDto';
import { CreateWorkspaceBo } from '../types/CreateWorkspaceType';
import { WorkspaceBo } from '../types/WorkspaceType';
import { WorkspaceListItemBo } from '../types/WorkspaceListItemType';

export interface IWorkspaceManagerService {
  createWorkspace(data: CreateWorkspaceBo): Promise<WorkspaceBo>;
  deleteWorkspace(id: string, authenticatedSub: string): Promise<void>;
  getWorkspaces(userId: string): Promise<WorkspaceListItemBo[]>;
}
