import { Module } from '@nestjs/common';
import { ISCAN_STATUS_SERVICE_TOKEN } from './interfaces/iscan-status-service';
import { ScanStatusService } from './scan-status.service';
import { ScanStatusController } from './scan-status.controller';

@Module({
  providers: [
    {
      provide: ISCAN_STATUS_SERVICE_TOKEN,
      useClass: ScanStatusService,
    },
  ],
  controllers: [ScanStatusController],
})
export class ScanModule {}
