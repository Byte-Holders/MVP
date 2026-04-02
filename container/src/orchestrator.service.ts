import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { StateGraph, START, END, Annotation, Send } from '@langchain/langgraph';

import {
  Target,
  Report,
  VulnerabilitiesReport,
  DepsReport,
  DocsReport,
  CoverageReport,
} from './types';
import { CoverageNodeService } from './nodes/coverage-node.service';
import { GithubNodeService } from './nodes/github-node.service';
import { SynthesizerNodeService } from './nodes/synthesizer-node.service';
import { SecurityNodeService } from './nodes/security-node.service';
import { RemediationNodeService } from './nodes/remediation-node.service';
import { DepsNodeService } from './nodes/dependency-node.service';

const WorkflowAnnotation = Annotation.Root({
  target: Annotation<Target>(),
  repoPath: Annotation<string>(),
  startScanTime: Annotation<Date>(),
  vulnerabilitiesReportPath: Annotation<string | undefined>(),
  languageBreakdown: Annotation<Record<string, number> | undefined>(),
  depsReport: Annotation<DepsReport | undefined>(),
  vulnerabilitiesReport: Annotation<VulnerabilitiesReport | undefined>(),
  docsReport: Annotation<DocsReport | undefined>(),
  coverageReport: Annotation<CoverageReport | undefined>(),
});

export type WorkflowState = typeof WorkflowAnnotation.State;

// Service
@Injectable()
export class OrchestratorService {
  constructor(
    private readonly coverageNode: CoverageNodeService,
    private readonly githubNode: GithubNodeService,
    private readonly synthesizerNode: SynthesizerNodeService,
    private readonly securityNode: SecurityNodeService,
    private readonly remediationNode: RemediationNodeService,
    private readonly dependencyNode: DepsNodeService,
  ) {}

  async execute(target: Target): Promise<WorkflowState | undefined> {
    const assignWorkers = (state: WorkflowState) => {
      return [
        new Send('coverage', state.repoPath),
        new Send('dependencies', state.repoPath),
        new Send('github', state.target),
        new Send('security', state.repoPath),
      ];
    };

    const workflow = new StateGraph(WorkflowAnnotation)
      .addNode('orchestrator', async (state: WorkflowState) => {
        const repoPath = await this.cloneRepo(state.target);
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
          vulnerabilities: state.vulnerabilitiesReport?.vulnerabilities,
        });
      })
      .addNode('dependencies', async (repoPath: string) => {
        return await this.dependencyNode.scan(repoPath);
      })
      .addNode('synthesizer', async (state: WorkflowState) => {
        const report = await this.synthesizerNode.summarize(state);
        return { report };
      })
      .addEdge(START, 'orchestrator')
      .addConditionalEdges('orchestrator', assignWorkers, [
        'coverage',
        'dependencies',
        'github',
        'security',
      ])
      .addEdge('coverage', 'synthesizer')
      .addEdge('github', 'synthesizer')
      .addEdge('security', 'remediation')
      .addEdge('remediation', 'synthesizer')
      .addEdge('dependencies', 'synthesizer')
      .addEdge('synthesizer', END);

    const app = workflow.compile();

    const finalReport = await app.invoke({ target });
    if (!finalReport) {
      throw new Error('Il synthesizer non ha prodotto un report.');
    }

    return finalReport;
  }

  // ─── Clone repo - identico al PoC ─────────────────────────────────────────
  private async cloneRepo(target: Target): Promise<string> {
    const url = `https://github.com/${target.owner}/${target.repository}.git`;

    console.log(`Ricevuto: ${url}`);

    const repoName = target.repository;
    const clonePath = path.join(
      process.env.REPOS_ROOT ?? '/usr/src/repos',
      repoName,
    );

    console.log(`Esecuzione git clone in ${clonePath}`);

    // Se la cartella esiste già, non clonare di nuovo
    if (fs.existsSync(clonePath)) {
      console.log('Repo già presente localmente.');
      return clonePath;
    }

    await git.clone({
      http,
      fs,
      dir: clonePath,
      url,
      singleBranch: true,
      depth: 1,
      ...(target.branch ? { ref: target.branch } : {}),
    });

    console.log(`Repo clonata con successo in ${clonePath}`);
    return clonePath;
  }
}
