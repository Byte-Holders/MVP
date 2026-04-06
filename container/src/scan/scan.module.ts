import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrchestratorService } from './nodes/orchestrator/orchestrator.service';
import { OrchestratorHelper } from './nodes/orchestrator/orchestrator.helper';
import { CoverageNodeService } from './nodes/coverage/coverage-node.service';
import { CoverageNodeHelper } from './nodes/coverage/coverage-node.helper';
import { GithubNodeService } from './nodes/github/github-node.service';
import { GithubNodeHelper } from './nodes/github/github-node.helper';
import { SynthesizerNodeService } from './nodes/synthesizer/synthesizer-node.service';
import { SynthesizerNodeHelper } from './nodes/synthesizer/synthesizer-node.helper';
import { SecurityNodeService } from './nodes/security/security-node.service';
import { SecurityNodeHelper } from './nodes/security/security-node.helper';
import { RemediationNodeService } from './nodes/remediation/remediation-node.service';
import { RemediationNodeHelper } from './nodes/remediation/remediation-node.helper';
import { DepsNodeService } from './nodes/dependency/dependency-node.service';
import { ReporterNodeService } from './nodes/reporter/reporter-node.service';
import { DocsNodeService } from './nodes/docs/docs-node.service';
import { DocsNodeHelper } from './nodes/docs/docs-node.helper';

@Module({
  imports: [HttpModule],
  providers: [
    OrchestratorService,
    OrchestratorHelper,
    CoverageNodeService,
    CoverageNodeHelper,
    GithubNodeService,
    GithubNodeHelper,
    SynthesizerNodeService,
    SynthesizerNodeHelper,
    SecurityNodeService,
    SecurityNodeHelper,
    RemediationNodeService,
    RemediationNodeHelper,
    DepsNodeService,
    ReporterNodeService,
    DocsNodeService,
    DocsNodeHelper,
  ],
  exports: [],
})
export class ScanModule {}
