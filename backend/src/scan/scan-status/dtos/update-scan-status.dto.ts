import { IsEnum, IsString } from 'class-validator';
import { ScanStatus } from '../enums/scan-status.enum';

export class UpdateScanStatusDto {
  @IsString()
  scanId: string;

  @IsEnum(ScanStatus)
  status: ScanStatus;
}
