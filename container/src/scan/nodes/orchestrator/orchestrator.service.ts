import { Inject, Injectable } from '@nestjs/common';
import { StateGraph, START, END, Send } from '@langchain/langgraph';
import { Target } from '../../target.types';
import { OrchestratorHelper } from './orchestrator.helper';
import {
  COVERAGE_NODE_SERVICE_TOKEN,
  CoverageNodeService,
} from './coverage/coverage-node.service';
import {
  GITHUB_NODE_SERVICE_TOKEN,
  GithubNodeService,
} from './github/github-node.service';
import { SynthesizerNodeService } from './synthesizer/synthesizer-node.service';
import {
  SECURITY_NODE_SERVICE_TOKEN,
  SecurityNodeService,
} from './security/security-node.service';
import {
  REMEDIATION_NODE_SERVICE_TOKEN,
  RemediationNodeService,
} from './remediation/remediation-node.service';
import {
  DEPENDENCY_NODE_SERVICE_TOKEN,
  DependencyNodeService,
} from './dependency/dependency-node.service';
import {
  DOCS_NODE_SERVICE_TOKEN,
  DocsNodeService,
} from './docs/docs-node.service';
import { WorkflowAnnotation, WorkflowState } from './workflow-state.type';
import { Report } from './synthesizer/synthesizer.types';
import type { INodeScanService } from './inode-scan-service.interface';

// Service
@Injectable()
export class OrchestratorService {
  constructor(
    private readonly helper: OrchestratorHelper,
    @Inject(COVERAGE_NODE_SERVICE_TOKEN)
    private readonly coverageNode: INodeScanService,
    @Inject(GITHUB_NODE_SERVICE_TOKEN)
    private readonly githubNode: INodeScanService,
    @Inject(SECURITY_NODE_SERVICE_TOKEN)
    private readonly securityNode: INodeScanService,
    @Inject(REMEDIATION_NODE_SERVICE_TOKEN)
    private readonly remediationNode: INodeScanService,
    @Inject(DEPENDENCY_NODE_SERVICE_TOKEN)
    private readonly dependencyNode: INodeScanService,
    @Inject(DOCS_NODE_SERVICE_TOKEN)
    private readonly docsNode: INodeScanService,
    private readonly synthesizerNode: SynthesizerNodeService,
  ) {}

  async execute(target: Target): Promise<Report | undefined> {
    const workflow = this.buildWorkflow();

    const app = workflow.compile();

    const finalReport = await app.invoke({ target });
    if (!finalReport) {
      throw new Error('Il synthesizer non ha prodotto un report.');
    }

    return finalReport.finalReport;
  }

  private buildWorkflow() {
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
        state.testReport,
        state.depsReport,
        state.docsReport,
        state.languages,
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
        return await this.coverageNode.scan({ repoPath });
      })
      .addNode('github', async (target: Target) => {
        return await this.githubNode.scan({ target });
      })
      .addNode('security', async (repoPath: string) => {
        return await this.securityNode.scan({ repoPath });
      })
      .addNode('remediation', async (state: WorkflowState) => {
        return await this.remediationNode.scan({
          vulnerabilitiesReportPath: state.vulnerabilitiesReportPath,
          vulnerabilitiesReport: state.vulnerabilitiesReport,
        });
      })
      .addNode('dependencies', async (repoPath: string) => {
        return await this.dependencyNode.scan({ repoPath });
      })
      .addNode('docs', async (repoPath: string) => {
        return await this.docsNode.scan({ repoPath });
      })
      .addNode('synthesizer', async (state: WorkflowState) => {
        const report = await this.synthesizerNode.summarize(state);
        return { finalReport: report };
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
      .addEdge('synthesizer', END);

    return workflow;
  }
}
