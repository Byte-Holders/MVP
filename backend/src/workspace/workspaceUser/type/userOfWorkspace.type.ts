import { WorkspaceRole } from "../../roles.enum";

export type UserOfWorkspaceInfo = {
    userId: string;
    username: string;
    role: WorkspaceRole;
};