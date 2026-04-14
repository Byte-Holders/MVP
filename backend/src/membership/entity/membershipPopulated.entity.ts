import { WorkspaceRole } from '../../workspace/roles.enum';
import { MembershipStatus } from '../dto/membership.dto';

export class MembershipPopulatedEntity {
  _id!: string;
  workspaceName!: string;
  senderUsername!: string;
  recipientUsername!: string;
  recipientRole!: WorkspaceRole;
  status!: MembershipStatus;
}
