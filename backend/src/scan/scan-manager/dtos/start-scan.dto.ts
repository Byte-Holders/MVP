import { IsString } from 'class-validator';

export class StartScanDto {
  @IsString()
  repositoryId: string;

  @IsString()
  workspaceId: string;

  @IsString()
  branch: string;
}