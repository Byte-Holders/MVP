import { IsNotEmpty, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportSummaryDto } from './report-summary.dto';
import { ReportDataDto } from './report-data.dto';
import { ReportMetadataDto } from './report-metadata.dto';

export class SaveReportDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportSummaryDto)
  summary?: ReportSummaryDto;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ReportDataDto)
  data!: ReportDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReportMetadataDto)
  metadata?: ReportMetadataDto;
}
