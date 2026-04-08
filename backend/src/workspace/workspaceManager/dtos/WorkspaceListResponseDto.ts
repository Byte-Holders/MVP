import { IsString } from 'class-validator';
import { WorkspaceResponseDto } from './WorkspaceResponseDto';

export class WorkspaceListResponseDto {
  @IsString()
  workspaces!: WorkspaceResponseDto[];
  total!: number;
}
