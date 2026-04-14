import { Module } from '@nestjs/common';
import {
  DEPENDENCY_NODE_SERVICE_TOKEN,
  DependencyNodeService,
} from './dependency-node.service';
import { DependencyNodeHelper } from './dependency-node.helper';

@Module({
  providers: [
    { provide: DEPENDENCY_NODE_SERVICE_TOKEN, useClass: DependencyNodeService },
    DependencyNodeHelper,
  ],
  exports: [DEPENDENCY_NODE_SERVICE_TOKEN],
})
export class DepsModule {}
