import { WorkspaceRole } from '../../workspace/roles.enum';

export enum ManageInviteAction {
  Accept = 'Accept',
  Reject = 'Reject',
}

export enum MembershipStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
}

export class InviteUserDto {
  workspaceId!: string;
  recipientUsername!: string;
  recipientRole!: WorkspaceRole;
}

export class ManageInviteDto {
  membershipId!: string;
  action!: ManageInviteAction;
}

export class GetInviteResponseDto {
  workspaceName!: string;
  senderUsername!: string;
  recipientUsername!: string;
  recipientRole!: WorkspaceRole;
  status!: MembershipStatus;
}
