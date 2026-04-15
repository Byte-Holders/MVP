import { ReportResponseDto } from './report-response.dto';
import { ReportDataDto } from './report-data.dto';
import { ReportSummaryDto } from './report-summary.dto';
import { ReportMetadataDto, ReportTargetDto } from './report-metadata.dto';

describe('ReportResponseDto', () => {
  it('should be instantiable with required field only', () => {
    const dto = new ReportResponseDto();
    dto.data = new ReportDataDto();

    expect(dto.data).toBeInstanceOf(ReportDataDto);
    expect(dto.summary).toBeUndefined();
    expect(dto.metadata).toBeUndefined();
  });

  it('should allow optional summary', () => {
    const summary = new ReportSummaryDto();
    summary.summary = 'Good repo';
    summary.mark = 8;

    const dto = new ReportResponseDto();
    dto.data = new ReportDataDto();
    dto.summary = summary;

    expect(dto.summary).toBe(summary);
    expect(dto.summary.summary).toBe('Good repo');
    expect(dto.summary.mark).toBe(8);
  });

  it('should allow optional metadata', () => {
    const target = new ReportTargetDto();
    target.branch = 'main';
    target.owner = 'owner';
    target.repositoryId = 'repo-1';

    const metadata = new ReportMetadataDto();
    metadata.startScanTime = '2024-01-01T00:00:00Z';
    metadata.endScanTime = '2024-01-01T01:00:00Z';
    metadata.target = target;

    const dto = new ReportResponseDto();
    dto.data = new ReportDataDto();
    dto.metadata = metadata;

    expect(dto.metadata).toBe(metadata);
    expect(dto.metadata.target.branch).toBe('main');
  });
});
