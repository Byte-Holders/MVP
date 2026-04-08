import { IsString } from 'class-validator';

export class GetScanStatusDto {
  @IsString()
  scanId: string;
}
