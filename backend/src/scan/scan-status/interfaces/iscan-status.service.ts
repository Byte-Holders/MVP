import { ScanStatus } from '../enums/scan-status.enum';

export interface IScanStatusService {
  getScanStatus(scanId: string): Promise<ScanStatus>;
  setScanStatus(scanId: string, scanStatus: ScanStatus): Promise<void>;
}

export const ISCAN_STATUS_SERVICE_TOKEN = 'IScanStatusService';
