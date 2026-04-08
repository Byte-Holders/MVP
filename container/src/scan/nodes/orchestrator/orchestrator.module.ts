import { Module } from '@nestjs/common';
import { OrchestratorHelper } from './orchestrator.helper';
import { OrchestratorService } from './orchestrator.service';
import { CoverageModule } from './coverage/coverage.module';
import { DepsModule } from './dependency/dependency.module';
import { DocsModule } from './docs/docs.module';
import { RemediationModule } from './remediation/remediation.module';
import { SecurityModule } from './security/security.module';
import { SynthesizerModule } from './synthesizer/synthesizer.module';
import { GithubModule } from './github/github.module';
@Module({
  imports: [
    CoverageModule,
    DepsModule,
    DocsModule,
    GithubModule,
    RemediationModule,
    SecurityModule,
    SynthesizerModule,
  ],
  providers: [OrchestratorHelper, OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
