import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OrchestratorModule } from './nodes/orchestrator/orchestrator.module';
import { ScanService } from './scan.service';
import { ReporterModule } from '../reporter/reporter.module';

@Module({
  imports: [HttpModule, ConfigModule, OrchestratorModule, ReporterModule],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
