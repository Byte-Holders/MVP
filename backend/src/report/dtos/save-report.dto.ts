import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportSummaryDto } from './report-summary.dto';
import { ReportDataDto } from './report-data.dto';
import { ReportMetadataDto } from './report-metadata.dto';

export class ReportBodyDto {
  @ApiPropertyOptional({ description: 'Riepilogo testuale e voto complessivo', type: () => ReportSummaryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportSummaryDto)
  summary?: ReportSummaryDto;

  @ApiProperty({ description: 'Dati del report suddivisi per area di analisi', type: () => ReportDataDto })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ReportDataDto)
  data!: ReportDataDto;

  @ApiPropertyOptional({ description: 'Metadati della scansione', type: () => ReportMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportMetadataDto)
  metadata?: ReportMetadataDto;
}

export class SaveReportDto {
  @ApiProperty({ description: 'JWT di callback firmato dal backend al momento dell\'avvio della scansione' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ description: 'Corpo del report inviato dal container scanner', type: () => ReportBodyDto })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ReportBodyDto)
  report!: ReportBodyDto;
}
