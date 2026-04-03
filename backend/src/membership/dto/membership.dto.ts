export enum ManageInviteAction {
  Accept = 'Accept',
  Reject = 'Reject',
}

export class InviteUserDto {
  workspace!: any;
  senderUsername!: string;
  recipientUsername!: string;
  recipientRole!: string;
}

export class ManageInviteDto {
  workspace!: any;
  username!: string;
  action!: ManageInviteAction;
}

export class GetInviteDto {
  username!: string;
}