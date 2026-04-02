import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { CoverageNodeService } from './nodes/coverage-node.service';
import { GithubNodeService } from './nodes/github-node.service';
import { SynthesizerNodeService } from './nodes/synthesizer-node.service';
import { SecurityNodeService } from './nodes/security-node.service';
import { RemediationNodeService } from './nodes/remediation-node.service';

@Module({
  imports: [],
  providers: [
    OrchestratorService,
    CoverageNodeService,
    GithubNodeService,
    SynthesizerNodeService,
    SecurityNodeService,
    RemediationNodeService,
  ],
  exports: [],
})
export class ScanModule {}
