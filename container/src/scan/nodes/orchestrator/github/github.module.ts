import { Module } from '@nestjs/common';
import { GithubNodeHelper } from './github-node.helper';
import {
  GITHUB_NODE_SERVICE_TOKEN,
  GithubNodeService,
} from './github-node.service';

@Module({
  providers: [
    { provide: GITHUB_NODE_SERVICE_TOKEN, useClass: GithubNodeService },
    GithubNodeHelper,
  ],
  exports: [GITHUB_NODE_SERVICE_TOKEN],
})
export class GithubModule {}
