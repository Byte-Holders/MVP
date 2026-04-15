import type { StartScanInfo } from '../../model/scan'

export interface IRepoRepository {
  requestScan(payload: StartScanInfo): Promise<string>
  stopScan(scanId: string): Promise<void>
}
