import { apiGet } from '../../../api/apiClient'
import type { IGetReportRepository } from '../interfaces/model/IGetReportRepository'
import type { ReportInfo } from '../types/report'

class GetReportRepository implements IGetReportRepository {
  async getReport(repositoryId: string, branch: string): Promise<ReportInfo> {
    return apiGet<ReportInfo>(
      `/api/reports/${repositoryId}/branches/${encodeURIComponent(branch)}`,
    )
  }
}

export const getReportRepository: IGetReportRepository = new GetReportRepository()
