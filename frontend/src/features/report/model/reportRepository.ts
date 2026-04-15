import { apiGet, ApiError } from '../../../api/apiClient'
import type { IReportRepository } from '../interfaces/repository/IReportRepository'
import type { ReportInfo } from '../types/report'

class ReportRepository implements IReportRepository {
  async getBranches(repositoryId: string): Promise<string[]> {
    try {
      return await apiGet<string[]>(`/api/repositories/${repositoryId}/branches`)
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
        return []
      }
      throw err
    }
  }

  async getReport(repositoryId: string, branch: string): Promise<ReportInfo> {
    return apiGet<ReportInfo>(
      `/api/reports/${repositoryId}/branches/${encodeURIComponent(branch)}`,
    )
  }
}

export const reportRepository: IReportRepository = new ReportRepository()
