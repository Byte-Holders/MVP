import { IsNotEmpty, IsString } from 'class-validator';

export class StartScanDto {
  @IsString()
  @IsNotEmpty()
  repositoryId: string;

  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @IsString()
  @IsNotEmpty()
  branch: string;
}
