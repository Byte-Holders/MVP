import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';

import { Target, Report, WorkflowState } from './types';
import { CoverageNodeService } from './nodes/coverage-node.service';
import { GithubNodeService } from './nodes/github-node.service';

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
  ) {}

  async execute(target: Target): Promise<Report | undefined> {
    // 1. Clone della repo, stesso pattern del PoC
    const repoPath = await this.cloneRepo(target);
    const startScanTime = new Date();

    const workflow = new StateGraph(WorkflowAnnotation)
      .addNode('coverage', async (state: State) => {
        return this.coverageNode.scan(state);
      })
      .addNode('github', async (state: State) => {
        return this.githubNode.scan(state);
      })
      .addEdge(START, 'coverage')
      .addEdge('coverage', 'github')
      .addEdge('github', END);

    let finalReport: Report | undefined;

    const app = workflow.compile();

    await app.invoke({
      target,
      repoPath,
      startScanTime,
    });

    // if (!finalReport) {
    //   throw new Error('Il synthesizer non ha prodotto un report.');
    // }

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
