import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReportTargetDto {
  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  repository?: string;

  @IsString()
  @IsNotEmpty()
  branch!: string;
}

export class ReportMetadataDto {
  @IsDateString()
  startScanTime!: string;

  @IsDateString()
  endScanTime!: string;

  @ValidateNested()
  @Type(() => ReportTargetDto)
  target!: ReportTargetDto;
}
