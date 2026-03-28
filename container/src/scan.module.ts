import { Module } from '@nestjs/common';
import { DepsNodeService } from './nodes/dependency-node.service';
import { SecurityNodeService } from './nodes/security-node.service';
import { RemediationNodeService } from './nodes/remediation-node.service';

@Module({
  imports: [],
  providers: [DepsNodeService, SecurityNodeService, RemediationNodeService],
  exports: [],
})
export class ScanModule {}
