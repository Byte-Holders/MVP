import { Module } from '@nestjs/common';
import { ISCAN_STATUS_SERVICE_TOKEN } from './interfaces/iscan-status-service';
import { ISCAN_REPOSITORY_TOKEN } from './interfaces/iscan.repository';

import { ScanStatusService } from './scan-status.service';
import { ScanStatusController } from './scan-status.controller';

import { ScanRepository } from './scan.repository';

@Module({
  providers: [
    {
      provide: ISCAN_STATUS_SERVICE_TOKEN,
      useClass: ScanStatusService,
    },
    {
      provide: ISCAN_REPOSITORY_TOKEN,
      useClass: ScanRepository,
    },
  ],
  controllers: [ScanStatusController],
})
export class ScanModule {}
