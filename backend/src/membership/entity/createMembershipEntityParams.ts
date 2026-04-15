import { MembershipStatus } from '../dto/membership.dto';

export class CreateMembershipEntityParams {
  workspaceId!: string;
  senderId!: string;
  recipientId!: string;
  recipientRole!: string;
  status!: MembershipStatus;
}
