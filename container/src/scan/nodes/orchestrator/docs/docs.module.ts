import { Module } from '@nestjs/common';
import { DocsNodeHelper } from './docs-node.helper';
import { DocsNodeService } from './docs-node.service';

@Module({
  providers: [DocsNodeHelper, DocsNodeService],
  exports: [DocsNodeService],
})
export class DocsModule {}
