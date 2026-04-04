import { Injectable } from '@nestjs/common';
import { IScanStatusService } from './interfaces/iscan-status-service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { SetScanStatusDto } from './dtos/set-scan-status.dto';
import { type IScanRepository } from './interfaces/iscan.repository';

@Injectable()
export class ScanStatusService implements IScanStatusService {
  getScanStatus(getScanStatusDto: GetScanStatusDto): GetScanStatusDto {
    throw new Error('Method not implemented.');
  }
  setScanStatus(setScanStatusDto: SetScanStatusDto): void {
    throw new Error('Method not implemented.');
  }
}
