import type { ReportInfo } from '../../types/report'

export interface IReportRepository {
  getBranches(repositoryId: string): Promise<string[]>
  getReport(repositoryId: string, branch: string): Promise<ReportInfo>
}
