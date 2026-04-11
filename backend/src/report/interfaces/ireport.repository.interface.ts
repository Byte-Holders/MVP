import type { ReportEntity } from '../entities/report.entity';

export interface IReportRepository {
  save(report: ReportEntity): Promise<ReportEntity>;
  findLatestByTarget(
    owner: string,
    repository: string,
    branch: string,
  ): Promise<ReportEntity | null>;
}

export const ReportRepositoryToken = 'REPORT_REPOSITORY';
