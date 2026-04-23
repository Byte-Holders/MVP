import { WorkspaceRole } from '../../roles.enum';
import { UserOfWorkspaceEntity } from '../entity/userOfWorkspace.entity';

export interface IWorkspaceUserRepository {
  addUserToWorkspace(
    user: UserOfWorkspaceEntity,
    workspaceId: string,
  ): Promise<void>;
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;
  getUsersOfWorkspace(workspaceId: string): Promise<UserOfWorkspaceEntity[]>;
  checkIfUserIsInWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<boolean>;
  getUserRoleForRepository(
    repositoryId: string,
    userId: string,
  ): Promise<WorkspaceRole | null>;
  getWorkspaceOwner(workspaceId: string): Promise<string>;
}

export const IWorkspaceUserRepositoryToken = 'IWorkspaceUserRepository';
