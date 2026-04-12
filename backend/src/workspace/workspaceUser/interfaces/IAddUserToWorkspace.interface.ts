import { UserOfWorkspaceInfo } from "../type/userOfWorkspace.type";

export interface IAddUserToWorkspace {
    addUserToWorkspace(user: UserOfWorkspaceInfo, workspaceId: string): Promise<void>;
}

export const IAddUserToWorkspaceToken = 'IAddUserToWorkspace';