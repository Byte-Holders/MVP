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

  async getScanStatus(getScanStatusDto: GetScanStatusDto): Promise<ScanStatus> {
    const scan = await this.scanRepository.find(getScanStatusDto);
    if (!scan) {
      // TODO forse conviene restituire `null`
      throw new Error(
        `Non sono state trovate scansioni in ${getScanStatusDto.repositoryId}/${getScanStatusDto.branch}`,
      );
    }
    return scan.status;
  }

  async setScanStatus(setScanStatusDto: UpdateScanStatusDto): Promise<void> {
    await this.scanRepository.update(setScanStatusDto);
  }
}
