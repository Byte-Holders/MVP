import { MembershipStatus } from "../dto/membership.dto";

export class MembershipInfo {
    workspaceId!: string;
    senderId!: string;
    recipientId!: string;
    recipientRole!: string;
    status!: MembershipStatus;
}