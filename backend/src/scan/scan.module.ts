import { Module } from '@nestjs/common';
import { ISCAN_STATUS_SERVICE_TOKEN } from './scan-status/interfaces/iscan-status.service';
import { ISCAN_REPOSITORY_TOKEN } from './interfaces/iscan.repository';

import { ScanStatusService } from './scan-status/scan-status.service';
import { ScanStatusController } from './scan-status/scan-status.controller';

import { ScanRepository } from './scan.repository';
import { ScanSchema, ScanSchemaClass } from './schemas/scan.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScanSchemaClass.name, schema: ScanSchema },
    ]),
  ],
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
