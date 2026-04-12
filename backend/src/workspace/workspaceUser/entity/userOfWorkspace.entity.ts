import { WorkspaceRole } from "src/workspace/roles.enum";

export class UserOfWorkspaceEntity {
    userId!: string;
    username!: string;
    role!: WorkspaceRole;
};