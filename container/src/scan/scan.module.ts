import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OrchestratorModule } from './nodes/orchestrator/orchestrator.module';
import { ScanService } from './scan.service';

@Module({
  imports: [HttpModule, ConfigModule, OrchestratorModule],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
