import { Module } from '@nestjs/common';
import { CoverageNodeHelper } from './coverage-node.helper';
import {
  COVERAGE_NODE_SERVICE_TOKEN,
  CoverageNodeService,
} from './coverage-node.service';

@Module({
  providers: [
    { provide: COVERAGE_NODE_SERVICE_TOKEN, useClass: CoverageNodeService },
    CoverageNodeHelper,
  ],
  exports: [COVERAGE_NODE_SERVICE_TOKEN],
})
export class CoverageModule {}
