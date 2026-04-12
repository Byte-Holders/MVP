import { WorkspaceRole } from 'src/workspace/roles.enum';
import { UserOfWorkspaceEntity } from '../entity/userOfWorkspace.entity';

export interface IWorkspaceUserRepository {
  addUserToWorkspace(user: UserOfWorkspaceEntity, workspaceId: string): Promise<void>;
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;
  getUsersOfWorkspace(workspaceId: string): Promise<UserOfWorkspaceEntity[]>;
  checkIfUserIsInWorkspace(workspaceId: string, userId: string): Promise<boolean>
}

export const IWorkspaceUserRepositoryToken = 'IWorkspaceUserRepository';