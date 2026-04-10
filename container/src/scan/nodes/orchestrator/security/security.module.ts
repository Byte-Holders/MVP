import { Module } from '@nestjs/common';
import { SecurityNodeHelper } from './security-node.helper';
import {
  SECURITY_NODE_SERVICE_TOKEN,
  SecurityNodeService,
} from './security-node.service';

@Module({
  providers: [
    { provide: SECURITY_NODE_SERVICE_TOKEN, useClass: SecurityNodeService },
    SecurityNodeHelper,
  ],
  exports: [SECURITY_NODE_SERVICE_TOKEN],
})
export class SecurityModule {}
