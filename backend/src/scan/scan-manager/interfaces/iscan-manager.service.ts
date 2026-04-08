import { Scan } from '../../entities/scan.entity';

export interface StartScanInfo {
  workspaceId: string;
  repositoryId: string;
  branch: string;
}

export interface IScanManagerService {
  startScan(info: StartScanInfo): Promise<Scan>;
  stopScan(scanId: string): Promise<void>;
}

export const ISCAN_MANAGER_SERVICE_TOKEN = 'IScanManagerService';
