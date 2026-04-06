import { Injectable } from '@nestjs/common';
import { StateGraph, START, END, Annotation, Send } from '@langchain/langgraph';

import { Target } from '../../target.types';
import { VulnerabilitiesReport } from './security/security-report.type';
import { DepsReport } from './dependency/deps-report.type';
import { DocsReport } from './docs/docs-report.type';
import { CoverageReport } from './coverage/coverage-report.type';
import { Report } from './synthesizer/synthesizer.types';
import { OrchestratorHelper } from './orchestrator.helper';
import { CoverageNodeService } from './coverage/coverage-node.service';
import { GithubNodeService } from './github/github-node.service';
import { SynthesizerNodeService } from './synthesizer/synthesizer-node.service';
import { SecurityNodeService } from './security/security-node.service';
import { RemediationNodeService } from './remediation/remediation-node.service';
import { DepsNodeService } from './dependency/dependency-node.service';
import { DocsNodeService } from './docs/docs-node.service';
import { ReporterNodeService } from './reporter/reporter-node.service';

const WorkflowAnnotation = Annotation.Root({
  target: Annotation<Target>(),
  repoPath: Annotation<string>(),
  startScanTime: Annotation<Date>(),
  vulnerabilitiesReportPath: Annotation<string | undefined>(),
  languageBreakdown: Annotation<Record<string, number> | undefined | null>(),
  depsReport: Annotation<DepsReport | undefined | null>(),
  vulnerabilitiesReport: Annotation<VulnerabilitiesReport | undefined | null>(),
  docsReport: Annotation<DocsReport | undefined | null>(),
  coverageReport: Annotation<CoverageReport | undefined | null>(),
  finalReport: Annotation<Report | undefined>(),
});

export type WorkflowState = typeof WorkflowAnnotation.State;

// Service
@Injectable()
export class OrchestratorService {
  constructor(
    private readonly helper: OrchestratorHelper,
    private readonly coverageNode: CoverageNodeService,
    private readonly githubNode: GithubNodeService,
    private readonly securityNode: SecurityNodeService,
    private readonly remediationNode: RemediationNodeService,
    private readonly dependencyNode: DepsNodeService,
    private readonly docsNode: DocsNodeService,
    private readonly synthesizerNode: SynthesizerNodeService,
    private readonly sendReportNode: ReporterNodeService,
  ) {}

  async execute(target: Target): Promise<WorkflowState | undefined> {
    const assignWorkers = (state: WorkflowState) => {
      return [
        new Send('coverage', state.repoPath),
        new Send('dependencies', state.repoPath),
        new Send('github', state.target),
        new Send('security', state.repoPath),
        new Send('docs', state.repoPath),
      ];
    };

    const checkExecutionEnd = (state: WorkflowState) => {
      const reports = [
        state.coverageReport,
        state.depsReport,
        state.docsReport,
        state.languageBreakdown,
        state.vulnerabilitiesReport,
      ];

      if (reports.filter((report) => report === undefined).length == 0)
        return 'synthesizer';

      return END;
    };

    type NoOpPathResult = '__end__' | 'synthesizer';
    const noopPaths: Record<string, NoOpPathResult> = {
      synthesizer: 'synthesizer',
      [END]: '__end__',
    };

    const workflow = new StateGraph(WorkflowAnnotation)
      .addNode('orchestrator', async (state: WorkflowState) => {
        const repoPath = await this.helper.cloneRepo(state.target);
        const startScanTime = new Date();
        return { repoPath, startScanTime };
      })
      .addNode('coverage', async (repoPath: string) => {
        return await this.coverageNode.scan(repoPath);
      })
      .addNode('github', async (target: Target) => {
        return await this.githubNode.scan(target);
      })
      .addNode('security', async (repoPath: string) => {
        return await this.securityNode.scan(repoPath);
      })
      .addNode('remediation', async (state: WorkflowState) => {
        return await this.remediationNode.scan({
          vulnerabilitiesReportPath: state.vulnerabilitiesReportPath,
          vulnerabilities: state.vulnerabilitiesReport,
        });
      })
      .addNode('dependencies', async (repoPath: string) => {
        return await this.dependencyNode.scan(repoPath);
      })
      .addNode('docs', async (repoPath: string) => {
        return await this.docsNode.scan(repoPath);
      })
      .addNode('synthesizer', async (state: WorkflowState) => {
        const report = await this.synthesizerNode.summarize(state);
        return { finalReport: report };
      })
      .addNode('reporter', async (state: WorkflowState) => {
        return await this.sendReportNode.sendReport(state.finalReport!);
      })
      .addEdge(START, 'orchestrator')
      .addConditionalEdges('orchestrator', assignWorkers, [
        'coverage',
        'dependencies',
        'github',
        'security',
        'docs',
      ])
      .addConditionalEdges('coverage', checkExecutionEnd, noopPaths)
      .addConditionalEdges('dependencies', checkExecutionEnd, noopPaths)
      .addConditionalEdges('github', checkExecutionEnd, noopPaths)
      .addConditionalEdges('remediation', checkExecutionEnd, noopPaths)
      .addConditionalEdges('docs', checkExecutionEnd, noopPaths)
      .addEdge('security', 'remediation')
      .addEdge('synthesizer', 'reporter')
      .addEdge('reporter', END);

    const app = workflow.compile();

    const finalReport = await app.invoke({ target });
    if (!finalReport) {
      throw new Error('Il synthesizer non ha prodotto un report.');
    }

    return finalReport;
  }
}
