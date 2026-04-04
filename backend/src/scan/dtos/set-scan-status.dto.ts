import { IsIn, IsString } from 'class-validator';
import { scanStatus, type ScanStatus } from '../types/scan-status.type';

export class SetScanStatusDto {
  @IsString()
  repository: string;

  @IsString()
  branch: string;

  @IsIn(scanStatus)
  status: ScanStatus;
}
