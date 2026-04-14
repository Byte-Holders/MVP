import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IScanStatusService } from './interfaces/iscan-status.service';
import {
  ISCAN_REPOSITORY_TOKEN,
  type IScanRepository,
} from '../interfaces/iscan.repository';
import { ScanStatus } from './enums/scan-status.enum';
import { Scan } from '../entities/scan.entity';

@Injectable()
export class ScanStatusService implements IScanStatusService {
  constructor(
    @Inject(ISCAN_REPOSITORY_TOKEN)
    private readonly scanRepository: IScanRepository,
  ) {}

  async getScanStatus(scanId: string): Promise<ScanStatus> {
    const scan = await this.scanRepository.find(scanId);
    if (!scan) {
      throw new NotFoundException(
        `Non sono state trovate scansioni con id ${scanId}`,
      );
    }
    return scan.status;
  }

  async setScanStatus(scanId: string, status: ScanStatus): Promise<void> {
    const scan = await this.scanRepository.find(scanId);
    if (!scan) {
      throw new NotFoundException(
        `Non sono state trovate scansioni con token ${scanId}`,
      );
    }

    await this.checkAndUpdateStatus(scan, status);
  }

  async setScanStatusFromToken(
    token: string,
    scanStatus: ScanStatus,
  ): Promise<void> {
    const scan = await this.scanRepository.findByToken(token);
    if (!scan) {
      throw new NotFoundException(
        `Non sono state trovate scansioni con token ${token}`,
      );
    }

    await this.checkAndUpdateStatus(scan, scanStatus);
  }

  private async checkAndUpdateStatus(old: Scan, updated: ScanStatus) {
    if (old.status !== ScanStatus.Started) {
      throw new ConflictException(`La scansione ${old.id} è già terminata`);
    }

    await this.scanRepository.update(old.id, {
      status: updated,
      endTime: new Date(),
    });
  }
}
