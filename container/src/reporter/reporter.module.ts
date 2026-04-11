import { Module } from '@nestjs/common';
import { ReporterService } from './reporter.service';
import { HttpModule } from '@nestjs/axios';
import { IREPORTER_SERVICE_TOKEN } from './ireporter-service.interface';

@Module({
  imports: [HttpModule],
  providers: [{ provide: IREPORTER_SERVICE_TOKEN, useClass: ReporterService }],
  exports: [IREPORTER_SERVICE_TOKEN],
})
export class ReporterModule {}
