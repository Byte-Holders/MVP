import { IsString } from 'class-validator';

export class GetScanStatusDto {
  @IsString()
  repositoryId: string;

  @IsString()
  branch: string;
}
