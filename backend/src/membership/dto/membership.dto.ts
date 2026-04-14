import { WorkspaceRole } from '../../workspace/roles.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

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
  @IsNotEmpty()
  @IsString()
  workspaceId!: string;
  @IsNotEmpty()
  @IsString()
  recipientUsername!: string;
  @IsNotEmpty()
  @IsEnum(WorkspaceRole)
  recipientRole!: WorkspaceRole;
}

export class ManageInviteDto {
  @IsNotEmpty()
  @IsString()
  membershipId!: string;

  @IsNotEmpty()
  @IsEnum(ManageInviteAction)
  action!: ManageInviteAction;
}

export class GetInviteResponseDto {
  _id!: string;
  workspaceName!: string;
  senderUsername!: string;
  recipientUsername!: string;
  recipientRole!: WorkspaceRole;
  status!: MembershipStatus;
}
