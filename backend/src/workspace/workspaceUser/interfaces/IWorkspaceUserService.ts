import { WorkspaceRole } from "src/workspace/roles.enum";
import { UserOfWorkspaceInfo } from "../type/userOfWorkspace.type";

export interface IWorkspaceUserService {
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;
  getUsersOfWorkspace(workspaceId: string): Promise<UserOfWorkspaceInfo[]>;
  getUserRoleForRepository(repositoryId: string, userId: string): Promise<WorkspaceRole | null>;
}

export const IWorkspaceUserServiceToken = 'IWorkspaceUserService';