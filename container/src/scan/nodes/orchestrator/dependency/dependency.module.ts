import { Module } from '@nestjs/common';
import {
  DEPENDENCY_NODE_SERVICE_TOKEN,
  DependencyNodeService,
} from './dependency-node.service';

@Module({
  providers: [
    { provide: DEPENDENCY_NODE_SERVICE_TOKEN, useClass: DependencyNodeService },
  ],
  exports: [DEPENDENCY_NODE_SERVICE_TOKEN],
})
export class DepsModule {}
