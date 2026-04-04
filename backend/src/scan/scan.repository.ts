import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { UpdateScanStatusDto } from './dtos/update-scan-status.dto';
import { IScanRepository } from './interfaces/iscan.repository';
import { Scan } from './schemas/scan.schema';

export class ScanRepository implements IScanRepository {
  get(getScanStatusDto: GetScanStatusDto): Promise<Scan> {
    throw new Error('Method not implemented.');
  }
  update(setScanStatusDto: UpdateScanStatusDto): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
