import { apiGet, apiPost, apiPatch } from '../../../api/apiClient'
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

  async getScanStatus(scanId: string): Promise<string> {
    return apiGet<string>(`/api/scan/${scanId}/status`)
  }
}

export const scanRepository: IScanRepository = new ScanRepository()
