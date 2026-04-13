import { IsDateString, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportTargetDto {
  @IsString()
  @IsNotEmpty()
  repositoryId!: string;

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
