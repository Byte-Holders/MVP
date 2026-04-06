import { Module } from '@nestjs/common';
import { ReporterNodeService } from './reporter-node.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ReporterNodeService],
  exports: [ReporterNodeService],
})
export class ReporterModule {}
