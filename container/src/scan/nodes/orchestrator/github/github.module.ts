import { Module } from '@nestjs/common';
import { GithubNodeHelper } from './github-node.helper';
import { GithubNodeService } from './github-node.service';

@Module({
  providers: [GithubNodeHelper, GithubNodeService],
  exports: [GithubNodeService],
})
export class GithubModule {}
