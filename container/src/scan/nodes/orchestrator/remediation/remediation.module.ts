import { Module } from '@nestjs/common';
import { RemediationNodeHelper } from './remediation-node.helper';
import { RemediationNodeService } from './remediation-node.service';

@Module({
  providers: [RemediationNodeHelper, RemediationNodeService],
  exports: [RemediationNodeService],
})
export class RemediationModule {}
