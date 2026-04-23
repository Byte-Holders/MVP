import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OrchestratorModule } from './nodes/orchestrator/orchestrator.module';
import { ScanService } from './scan.service';
import { ISCAN_SERVICE_TOKEN } from './iscan-service.interface';

@Module({
  imports: [HttpModule, ConfigModule, OrchestratorModule],
  providers: [{ provide: ISCAN_SERVICE_TOKEN, useClass: ScanService }],
  exports: [ISCAN_SERVICE_TOKEN],
})
export class ScanModule {}
