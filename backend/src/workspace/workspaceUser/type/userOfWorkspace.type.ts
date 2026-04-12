import { WorkspaceRole } from "src/workspace/roles.enum";

export type UserOfWorkspaceInfo = {
    userId: string;
    username: string;
    role: WorkspaceRole;
};