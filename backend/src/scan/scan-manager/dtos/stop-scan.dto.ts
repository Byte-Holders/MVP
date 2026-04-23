import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StopScanDto {
  @ApiProperty({ description: 'ID della scansione da interrompere' })
  @IsString()
  @IsNotEmpty()
  scanId: string;
}
