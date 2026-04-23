import { Module } from '@nestjs/common';
import { RemediationNodeHelper } from './remediation-node.helper';
import {
  REMEDIATION_NODE_SERVICE_TOKEN,
  RemediationNodeService,
} from './remediation-node.service';

@Module({
  providers: [
    {
      provide: REMEDIATION_NODE_SERVICE_TOKEN,
      useClass: RemediationNodeService,
    },
    RemediationNodeHelper,
  ],
  exports: [REMEDIATION_NODE_SERVICE_TOKEN],
})
export class RemediationModule {}
