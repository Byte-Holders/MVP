import { Module } from '@nestjs/common';
import { CoverageNodeHelper } from './coverage-node.helper';
import { CoverageNodeService } from './coverage-node.service';

@Module({
  providers: [CoverageNodeHelper, CoverageNodeService],
  exports: [CoverageNodeService],
})
export class CoverageModule {}
