import { IsString } from 'class-validator';

export class WorkspaceResponseDto {
  @IsString()
  id!: string;
  @IsString()
  name!: string;
  @IsString()
  owner!: string; // username, non userId
  @IsString()
  role!: string; // ruolo del requester (owner, editor, viewer)
}
