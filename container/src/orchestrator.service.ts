import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';

import { Target, Report, WorkflowState } from './types';
import { SecurityNodeService }    from './nodes/security-node.service';
import { CoverageNodeService }    from './nodes/coverage-node.service';
import { RemediationNodeService } from './nodes/remediation-node.service';
import { DocsNodeService }        from './nodes/docs-node.service';
import { GithubNodeService }      from './nodes/github-node.service';
import { DepsNodeService }        from './nodes/dependency-node.service';
import { SynthesizerNode }        from './nodes/synthesizer-node.service';

// Stato del grafo
const WorkflowAnnotation = Annotation.Root({
    target:                 Annotation<Target>(),
    repoPath:               Annotation<string>(),
    startScanTime:          Annotation<Date>(),
    semgrepReportPath:      Annotation<string | undefined>(),
    languageBreakdown:      Annotation<Record<string, number> | undefined>(),
    depsReport:             Annotation<WorkflowState['depsReport']>(),
    vulnerabilitiesReport:  Annotation<WorkflowState['vulnerabilitiesReport']>(),
    docsReport:             Annotation<WorkflowState['docsReport']>(),
    coverageReport:         Annotation<WorkflowState['coverageReport']>(),
});

type State = typeof WorkflowAnnotation.State;

// Service
@Injectable()
export class OrchestratorService {

    constructor(
        private readonly securityNode:    SecurityNodeService,
        private readonly coverageNode:    CoverageNodeService,
        private readonly remediationNode: RemediationNodeService,
        private readonly docsNode:        DocsNodeService,
        private readonly githubNode:      GithubNodeService,
        private readonly depsNode:        DepsNodeService,
        private readonly synthesizerNode: SynthesizerNode,
    ) {}

    async execute(target: Target): Promise<Report> {
        // 1. Clone della repo, stesso pattern del PoC
        const repoPath = await this.cloneRepo(target);
        const startScanTime = new Date();

        const workflow = new StateGraph(WorkflowAnnotation)

            // Nodo 1: Semgrep scan
            .addNode('security', async (state: State) => {
                return this.securityNode.Scan(state);
            })

            // Nodo 2: Test coverage
            .addNode('coverage', async (state: State) => {
                return this.coverageNode.Scan(state);
            })

            // Nodo 3: Remediation AI
            .addNode('remediation', async (state: State) => {
                return this.remediationNode.Scan(state);
            })

            // Nodo 4: Analisi documentazione / README
            .addNode('docs', async (state: State) => {
                return this.docsNode.Scan(state);
            })

            // Nodo 5: Linguaggi GitHub
            .addNode('github', async (state: State) => {
                return this.githubNode.getLanguages(state);
            })

            // Nodo 6: Dipendenze Syft
            .addNode('deps', async (state: State) => {
                return this.depsNode.Scan(state);
            })

            // Nodo 7: Sintesi finale e costruzione del Report tipizzato
            .addNode('synthesizer', async (state: State) => {
                finalReport = await this.synthesizerNode.summarize(state as any);
                return {};
            })

            // Edges - stessa sequenza lineare del PoC
            .addEdge(START,       'security')
            .addEdge('security',  'coverage')
            .addEdge('coverage',  'remediation')
            .addEdge('remediation','docs')
            .addEdge('docs',      'github')
            .addEdge('github',    'deps')
            .addEdge('deps',      'synthesizer')
            .addEdge('synthesizer', END);

        let finalReport: Report | undefined;

        const app = workflow.compile();

        await app.invoke({
            target,
            repoPath,
            startScanTime,
        });

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
        const clonePath = path.join(process.env.REPOS_ROOT ?? '/usr/src/repos', repoName);

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