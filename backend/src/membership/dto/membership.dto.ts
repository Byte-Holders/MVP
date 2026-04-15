import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'ID del workspace a cui invitare l\'utente'
  })
  @IsNotEmpty()
  @IsString()
  workspaceId!: string;

  @ApiProperty({
    description: 'Username del destinatario dell\'invito'
  })
  @IsNotEmpty()
  @IsString()
  recipientUsername!: string;

  @ApiProperty({
    description: 'Ruolo dell\'utente invitato',
    enum: WorkspaceRole
  })
  @IsNotEmpty()
  @IsEnum(WorkspaceRole)
  recipientRole!: WorkspaceRole;
}

export class ManageInviteDto {
  @ApiProperty({
    description: 'Azione da compiere sull\'invito',
    enum: ManageInviteAction
  })
  @IsNotEmpty()
  @IsEnum(ManageInviteAction)
  action!: ManageInviteAction;
}

export class GetInviteResponseDto {
  @ApiProperty({
    description: 'ID dell\'invito'
  })
  _id!: string;

  @ApiProperty({
    description: 'Nome del workspace'
  })
  workspaceName!: string;

  @ApiProperty({
    description: 'Username dell\'utente che ha inviato l\'invito'
  })
  senderUsername!: string;

  @ApiProperty({
    description: 'Username del destinatario dell\'invito'
  })
  recipientUsername!: string;

  @ApiProperty({
    description: 'Ruolo del destinatario dell\'invito',
    enum: WorkspaceRole
  })
  recipientRole!: WorkspaceRole;

  @ApiProperty({
    description: 'Stato dell\'invito',
    enum: MembershipStatus
  })
  status!: MembershipStatus;
}
