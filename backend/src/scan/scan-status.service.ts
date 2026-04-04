import { Inject, Injectable } from '@nestjs/common';
import { IScanStatusService } from './interfaces/iscan-status-service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { UpdateScanStatusDto } from './dtos/update-scan-status.dto';
import {
  ISCAN_REPOSITORY_TOKEN,
  type IScanRepository,
} from './interfaces/iscan.repository';
import { ScanStatus } from './types/scan-status.type';

@Injectable()
export class ScanStatusService implements IScanStatusService {
  constructor(
    @Inject(ISCAN_REPOSITORY_TOKEN)
    private readonly scanRepository: IScanRepository,
  ) {}
  async getScanStatus(getScanStatusDto: GetScanStatusDto): Promise<ScanStatus> {
    return (await this.scanRepository.get(getScanStatusDto)).status;
  }
  async setScanStatus(setScanStatusDto: UpdateScanStatusDto): Promise<void> {
    await this.scanRepository.update(setScanStatusDto);
  }
}
