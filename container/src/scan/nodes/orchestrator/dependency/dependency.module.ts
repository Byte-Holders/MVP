import { Module } from '@nestjs/common';
import { DepsNodeService } from './dependency-node.service';

@Module({
  providers: [DepsNodeService],
  exports: [DepsNodeService],
})
export class DepsModule {}
