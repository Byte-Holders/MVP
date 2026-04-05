import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ISCAN_REPOSITORY_TOKEN,
  type IScanRepository,
} from '../interfaces/iscan.repository';
import { IScanManagerService } from './interfaces/iscan-manager.service';
import { Scan } from '../entities/scan.entity';
import { StartScanDto } from './dtos/start-scan.dto';
import { StopScanDto } from './dtos/stop-scan.dto';
import { CreateScanDto } from '../dtos/create-scan.dto';
import { ScanStatus } from '../scan-status/enums/scan-status.enum';

@Injectable()
export class ScanManagerService implements IScanManagerService {
  constructor(
    // TODO injection WorkspaceUserService
    @Inject(ISCAN_REPOSITORY_TOKEN)
    private readonly scanRepository: IScanRepository,
    private readonly logger: Logger,
  ) {}

  async startScan(dto: StartScanDto): Promise<Scan> {
    this.logger.log(
      `Lancio scansione verso workspace ${dto.workspaceId}, repository ${dto.repositoryId}, branch ${dto.branch} `,
    );
    // TODO controllo appartenenza utente a ws
    // TODO lancio container
    const containerRef = 'dontLeakMePlease';

    const createScanDto: CreateScanDto = {
      ...dto,
      containerRef, // da vedere connessione con aws
    };
    await this.scanRepository.create(createScanDto);
    // placeholder
    const scan: Scan = {
      id: 'scanId',
      workspaceId: dto.workspaceId,
      target: {
        repositoryId: dto.repositoryId,
        branchName: dto.branch,
      },

      startTime: new Date(),

      status: ScanStatus.Started,
      containerRef,
    };

    return scan;
  }

  stopScan(dto: StopScanDto): Promise<void> {
    // TODO stop container e aggiornamento stato
    throw new Error('Method not implemented.');
  }
}
