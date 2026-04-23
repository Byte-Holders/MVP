import type { ReportEntity } from '../entities/report.entity';

export interface IReportRepository {
  saveReport(report: ReportEntity): Promise<void>;
  getReport(repositoryId: string, branch: string): Promise<ReportEntity | null>;
}

export const ReportRepositoryToken = 'REPORT_REPOSITORY';
