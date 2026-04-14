import { Module } from '@nestjs/common';
import { LinguistAdapter } from './linguist-adapter';
import {
  GITHUB_NODE_SERVICE_TOKEN,
  GithubNodeService,
} from './github-node.service';

@Module({
  providers: [
    { provide: GITHUB_NODE_SERVICE_TOKEN, useClass: GithubNodeService },
    LinguistAdapter,
  ],
  exports: [GITHUB_NODE_SERVICE_TOKEN],
})
export class GithubModule {}
