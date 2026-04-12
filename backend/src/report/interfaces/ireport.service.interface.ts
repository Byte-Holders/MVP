import type { ReportInfo } from '../types/report.type';

export interface IReportService {
  saveReport(report: ReportInfo): Promise<void>;
  getReport(
    repositoryId: string,
    branch: string,
  ): Promise<ReportInfo>;
}

export const ReportServiceToken = 'REPORT_SERVICE';
