import {
  IsDefined,
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
  @IsNotEmpty()
  owner?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  repositoryId?: string;

  @IsString()
  @IsNotEmpty()
  branch!: string;
}

export class ReportMetadataDto {
  @IsDateString()
  startScanTime!: string;

  @IsDateString()
  endScanTime!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => ReportTargetDto)
  target!: ReportTargetDto;
}
