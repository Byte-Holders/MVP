import { WorkspaceRole } from "../../roles.enum";

export class UserOfWorkspaceEntity {
    userId!: string;
    username!: string;
    role!: WorkspaceRole;
};