import { Injectable } from '@nestjs/common';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { Report, ReportSummary } from './synthesizer.types';
import { WorkflowState } from '../orchestrator/orchestrator.service';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';

@Injectable()
export class SynthesizerNodeService {
  constructor(private readonly helper: SynthesizerNodeHelper) {}

  async summarize(state: WorkflowState): Promise<Report> {
    console.log('[SynthesizerNode] Building final report...');

    const context = JSON.stringify(
      {
        vulnerabilities: state.vulnerabilitiesReport,
        coverage: state.coverageReport,
        documentation: state.docsReport,
        languages: state.languageBreakdown,
      },
      null,
      2,
    );

    let reportSummary: ReportSummary;

    try {
      const response = await this.helper.createModel().invoke([
        new SystemMessage(
          `Sei un tech lead esperto. Ricevi i risultati aggregati dell'analisi di una repository (sicurezza, coverage, dipendenze, documentazione).
Restituisci SOLO un JSON con questa struttura, senza markdown:
{
  "summary": "<testo discorsivo max 300 parole che mette in relazione tutti gli aspetti>",
  "mark": <voto intero da 1 a 10>
}`,
        ),
        new HumanMessage(`Dati analisi:\n${context}`),
      ]);

      const raw = (response.content as string)
        .replace(/```json|```/g, '')
        .trim();
      reportSummary = JSON.parse(raw) as ReportSummary;

      console.log(
        `[SynthesizerNode] Summary generated. Summary: ${reportSummary.summary}\nMark: ${reportSummary.mark}/10`,
      );
    } catch (error) {
      console.error(
        '[SynthesizerNode] AI summary failed, using fallback.',
        error,
      );
      reportSummary = {
        summary:
          'Analisi completata. Consultare i dati dettagliati per i risultati completi.',
        mark: 5,
      };
    }

    const report: Report = {
      summary: reportSummary,
      data: {
        depsReport: state.depsReport ?? { report: [] },
        vulnerabilitiesReport: state.vulnerabilitiesReport ?? {
          vulnerabilities: [],
          mark: 10,
        },
        docsReport: state.docsReport ?? {
          readmeReport: { analysis: { analysis: '' } },
          commentReport: [],
          mark: 0,
        },
        coverageReport: state.coverageReport ?? {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
      },
      metadata: {
        startScanTime: state.startScanTime,
        endScanTime: new Date(),
        target: state.target,
      },
    };

    console.log('[SynthesizerNode] Report built successfully.');

    console.log(`[SynthesizerNode] REPORT:\n`);
    console.log(`[SynthesizerNode] ---------------------------`);
    console.log(`[SynthesizerNode] ${JSON.stringify(report)}`);
    console.log(`[SynthesizerNode] ===========================`);
    return report;
  }
}
