import { Inject, Injectable } from '@nestjs/common';
import { IScanStatusService } from './interfaces/iscan-status.service';
import {
  ISCAN_REPOSITORY_TOKEN,
  type IScanRepository,
} from '../interfaces/iscan.repository';
import { ScanStatus } from './enums/scan-status.enum';

@Injectable()
export class ScanStatusService implements IScanStatusService {
  constructor(
    @Inject(ISCAN_REPOSITORY_TOKEN)
    private readonly scanRepository: IScanRepository,
  ) {}

  async getScanStatus(scanId: string): Promise<ScanStatus> {
    const scan = await this.scanRepository.find(scanId);
    if (!scan) {
      throw new Error(`Non sono state trovate scansioni in ${scanId}`);
    }
    return scan.status;
  }

  async setScanStatus(scanId: string, status: ScanStatus): Promise<void> {
    await this.scanRepository.update(scanId, { status });
  }
}
