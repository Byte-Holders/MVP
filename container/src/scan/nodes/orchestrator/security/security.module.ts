import { Module } from '@nestjs/common';
import { SecurityNodeHelper } from './security-node.helper';
import { SecurityNodeService } from './security-node.service';

@Module({
  providers: [SecurityNodeHelper, SecurityNodeService],
  exports: [SecurityNodeService],
})
export class SecurityModule {}
