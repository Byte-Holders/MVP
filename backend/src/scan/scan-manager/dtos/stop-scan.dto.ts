import { IsString } from 'class-validator';

export class StopScanDto {
  @IsString()
  scanId: string;
}
