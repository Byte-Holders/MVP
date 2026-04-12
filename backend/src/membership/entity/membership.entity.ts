import { WorkspaceRole } from "src/workspace/roles.enum";

export class MembershipEntity {
    _id!: string;
    workspaceId!: string;
    senderId!: string;
    recipientId!: string;
    recipientRole!: WorkspaceRole;
    status!: string;
}