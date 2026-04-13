import { ReportSummaryDto } from './report-summary.dto';
import { ReportDataDto } from './report-data.dto';
import { ReportMetadataDto } from './report-metadata.dto';

export class ReportResponseDto {
  summary?: ReportSummaryDto;
  data!: ReportDataDto;
  metadata?: ReportMetadataDto;
}
