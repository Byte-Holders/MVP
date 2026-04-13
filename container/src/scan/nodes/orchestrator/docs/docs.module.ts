import { Module } from '@nestjs/common';
import { DocsNodeHelper } from './docs-node.helper';
import { DOCS_NODE_SERVICE_TOKEN, DocsNodeService } from './docs-node.service';

@Module({
  providers: [
    { provide: DOCS_NODE_SERVICE_TOKEN, useClass: DocsNodeService },
    DocsNodeHelper,
  ],
  exports: [DOCS_NODE_SERVICE_TOKEN],
})
export class DocsModule {}
