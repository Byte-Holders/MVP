import { GetScanStatusDto } from '../dtos/get-scan-status.dto';
import { SetScanStatusDto } from '../dtos/set-scan-status.dto';
import type { ScanStatus } from '../types/scan-status.type';

export interface IScanRepository {
  get(getScanStatusDto: GetScanStatusDto): ScanStatus;
  update(setScanStatusDto: SetScanStatusDto): void;
}

export const ISCAN_REPOSITORY_TOKEN = 'IScanRepository';
