import { IsEnum, IsString } from 'class-validator';
import { ScanStatus } from '../enums/scan-status.enum';

export class UpdateScanStatusDto {
  @IsString()
  repositoryId: string;

  @IsString()
  branch: string;

  @IsEnum(ScanStatus)
  status: ScanStatus;
}
