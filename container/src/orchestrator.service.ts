import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { StateGraph, START, END, Annotation, Send } from '@langchain/langgraph';

import { Target, Report, WorkflowState } from './types';
import { CoverageNodeService } from './nodes/coverage-node.service';
import { GithubNodeService } from './nodes/github-node.service';
import { SynthesizerNodeService } from './nodes/synthesizer-node.service';

// Stato del grafo
const WorkflowAnnotation = Annotation.Root({
  target: Annotation<Target>(),
  repoPath: Annotation<string>(),
  startScanTime: Annotation<Date>(),
  semgrepReportPath: Annotation<string | undefined>(),
  languageBreakdown: Annotation<Record<string, number> | undefined>(),
  depsReport: Annotation<WorkflowState['depsReport']>(),
  vulnerabilitiesReport: Annotation<WorkflowState['vulnerabilitiesReport']>(),
  docsReport: Annotation<WorkflowState['docsReport']>(),
  coverageReport: Annotation<WorkflowState['coverageReport']>(),
});

type State = typeof WorkflowAnnotation.State;

// Service
@Injectable()
export class OrchestratorService {
  constructor(
    private readonly coverageNode: CoverageNodeService,
    private readonly githubNode: GithubNodeService,
    private readonly synthesizerNode: SynthesizerNodeService,
  ) {}

  async execute(target: Target): Promise<WorkflowState | undefined> {
    const assignWorkers = (state: State) => {
      return [
        new Send('coverage', state.repoPath),
        new Send('github', state.target),
      ];
    };

    const workflow = new StateGraph(WorkflowAnnotation)
      .addNode('orchestrator', async (state: State) => {
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
      .addNode('synthesizer', async (state: State) => {
        const report = await this.synthesizerNode.summarize(state);
        return { report };
      })
      .addEdge(START, 'orchestrator')
      .addConditionalEdges('orchestrator', assignWorkers, [
        'coverage',
        'github',
      ])
      .addEdge('coverage', 'synthesizer')
      .addEdge('github', 'synthesizer')
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
