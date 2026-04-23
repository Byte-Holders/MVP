import type { StartScanInfo } from '../../model/scan'

export interface IScanRepository {
  requestScan(payload: StartScanInfo): Promise<string>
  stopScan(scanId: string): Promise<void>
  getScanStatus(scanId: string): Promise<string>
}
