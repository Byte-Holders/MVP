import { type GetScanStatusDto } from '../dtos/get-scan-status.dto';
import { SetScanStatusDto } from '../dtos/set-scan-status.dto';
export interface IScanStatusService {
  getScanStatus(getScanStatusDto: GetScanStatusDto): GetScanStatusDto;
  setScanStatus(setScanStatusDto: SetScanStatusDto): void;
}

export const ISCAN_STATUS_SERVICE_TOKEN = 'IScanStatusService';
