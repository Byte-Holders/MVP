import type { ReportInfo } from '../types/report.type';

export interface IReportService {
  saveReport(report: ReportInfo, callbackToken: string): Promise<void>;
  getReport(
    repositoryId: string,
    branch: string,
    userId: string,
  ): Promise<ReportInfo>;
}

export const ReportServiceToken = 'REPORT_SERVICE';
