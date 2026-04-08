import { Inject, Injectable } from '@nestjs/common';
import { IScanStatusService } from './interfaces/iscan-status.service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { UpdateScanStatusDto } from './dtos/update-scan-status.dto';
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

  async getScanStatus(dto: GetScanStatusDto): Promise<ScanStatus> {
    const scan = await this.scanRepository.find(dto.scanId);
    if (!scan) {
      // TODO forse conviene restituire `null`
      throw new Error(`Non sono state trovate scansioni in ${dto.scanId}`);
    }
    return scan.status;
  }

  async setScanStatus(dto: UpdateScanStatusDto): Promise<void> {
    await this.scanRepository.update(dto.scanId, { status: dto.status });
  }
}
