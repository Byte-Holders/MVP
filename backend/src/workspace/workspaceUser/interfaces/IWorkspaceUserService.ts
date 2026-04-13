import { UserOfWorkspaceInfo } from "../type/userOfWorkspace.type";

export interface IWorkspaceUserService {
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;
  getUsersOfWorkspace(workspaceId: string): Promise<UserOfWorkspaceInfo[]>;
}

export const IWorkspaceUserServiceToken = 'IWorkspaceUserService';