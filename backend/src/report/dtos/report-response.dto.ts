import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportSummaryDto } from './report-summary.dto';
import { ReportDataDto } from './report-data.dto';
import { ReportMetadataDto } from './report-metadata.dto';

export class ReportResponseDto {
  @ApiPropertyOptional({ description: 'Riepilogo testuale e voto complessivo del report', type: () => ReportSummaryDto })
  summary?: ReportSummaryDto;

  @ApiProperty({ description: 'Dati completi del report suddivisi per area di analisi', type: () => ReportDataDto })
  data!: ReportDataDto;

  @ApiPropertyOptional({ description: 'Metadati della scansione (tempi, target)', type: () => ReportMetadataDto })
  metadata?: ReportMetadataDto;
}
