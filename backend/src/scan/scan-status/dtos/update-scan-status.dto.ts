import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScanStatus } from '../enums/scan-status.enum';

export class UpdateScanStatusDto {
  @ApiProperty({ description: 'ID della scansione' })
  @IsString()
  scanId: string;

  @ApiProperty({ enum: ScanStatus, description: 'Nuovo stato della scansione' })
  @IsEnum(ScanStatus)
  status: ScanStatus;
}
