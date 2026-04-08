import { Module } from '@nestjs/common';
import { ReporterService } from './reporter.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ReporterService],
  exports: [ReporterService],
})
export class ReporterModule {}
