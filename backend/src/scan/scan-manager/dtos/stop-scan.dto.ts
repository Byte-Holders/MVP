import { IsNotEmpty, IsString } from 'class-validator';

export class StopScanDto {
  @IsString()
  @IsNotEmpty()
  scanId: string;
}
