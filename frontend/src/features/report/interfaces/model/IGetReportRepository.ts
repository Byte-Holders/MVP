import type { ReportInfo } from '../../types/report'

export interface IGetReportRepository {
  getReport(repositoryId: string, branch: string): Promise<ReportInfo>
}
