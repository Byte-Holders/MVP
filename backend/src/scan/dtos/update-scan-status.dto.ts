import { IsIn, IsString } from 'class-validator';
import { scanStatus, type ScanStatus } from '../types/scan-status.type';

export class UpdateScanStatusDto {
  @IsString()
  repositoryId: string;

  @IsString()
  branch: string;

  @IsIn(scanStatus)
  status: ScanStatus;
}
