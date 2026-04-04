export enum ManageInviteAction {
  Accept = 'Accept',
  Reject = 'Reject',
}

export class InviteUserDto {
  workspaceId!: string;
  senderId!: string;
  recipientId!: string;
  recipientRole!: string;
}

export class ManageInviteDto {
  workspaceId!: string;
  userId!: string;
  action!: ManageInviteAction;
}

export class GetInviteDto {
  userId!: string;
}
  
export class AddInviteDto {
  workspaceId!: string;
  senderId!: string;
  recipientId!: string;
  recipientRole!: string;
}

export class UpdateInviteDto {
  membershipId!: string;
  action!: ManageInviteAction;
}

export class ResearchInviteDto {
  workspaceId!: string;
  userId!: string;
}