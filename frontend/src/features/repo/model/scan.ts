import { apiPost, apiPatch } from '../../../api/apiClient'
import type { IRepoRepository } from '../interfaces/repository/IRepoRepository'

export interface StartScanInfo {
  workspaceId: string
  repositoryId: string
  branch: string
}

class RepoRepository implements IRepoRepository {
  async requestScan(payload: StartScanInfo): Promise<string> {
    const data = await apiPost<{ scanId: string }>('/api/scan', payload)
    return data.scanId
  }

  async stopScan(scanId: string): Promise<void> {
    return apiPatch('/api/scan', { scanId })
  }
}

export const scanRepository: IRepoRepository = new RepoRepository()
