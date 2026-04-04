import { GetScanStatusDto } from '../dtos/get-scan-status.dto';
import { UpdateScanStatusDto } from '../dtos/update-scan-status.dto';
import { Scan } from '../schemas/scan.schema';

export interface IScanRepository {
  get(getScanStatusDto: GetScanStatusDto): Promise<Scan>;
  update(setScanStatusDto: UpdateScanStatusDto): Promise<void>;
}

export const ISCAN_REPOSITORY_TOKEN = 'IScanRepository';
