import { ApiProperty } from '@nestjs/swagger';

export class StartScanResponseDto {
  @ApiProperty({ description: 'ID univoco della scansione avviata' })
  scanId: string;
}
