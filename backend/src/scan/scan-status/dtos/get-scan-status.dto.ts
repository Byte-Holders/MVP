import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetScanStatusDto {
  @ApiProperty({ description: 'ID della scansione' })
  @IsString()
  scanId: string;
}
