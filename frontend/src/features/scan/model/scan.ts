import { apiPost, apiPatch } from '../../../api/apiClient'
import type { IScanRepository } from '../interfaces/model/IScanRepository'

export interface StartScanInfo {
  workspaceId: string
  repositoryId: string
  branch: string
}

class ScanRepository implements IScanRepository {
  async requestScan(payload: StartScanInfo): Promise<string> {
    const data = await apiPost<{ scanId: string }>('/api/scan', payload)
    return data.scanId
  }

  async stopScan(scanId: string): Promise<void> {
    return apiPatch('/api/scan', { scanId })
  }
}

export const scanRepository: IScanRepository = new ScanRepository()
