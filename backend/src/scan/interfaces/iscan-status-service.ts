import { type GetScanStatusDto } from '../dtos/get-scan-status.dto';
import { UpdateScanStatusDto } from '../dtos/update-scan-status.dto';
import { ScanStatus } from '../types/scan-status.type';

export interface IScanStatusService {
  getScanStatus(getScanStatusDto: GetScanStatusDto): Promise<ScanStatus>;
  setScanStatus(setScanStatusDto: UpdateScanStatusDto): Promise<void>;
}

export const ISCAN_STATUS_SERVICE_TOKEN = 'IScanStatusService';
