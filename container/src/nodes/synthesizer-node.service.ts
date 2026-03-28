import { Injectable } from '@nestjs/common';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatBedrockConverse } from '@langchain/aws';
import { WorkflowState, Report, ReportSummary } from '../types';

@Injectable()
export class SynthesizerNode {

  private createModel() {
    return new ChatBedrockConverse({
      model:       process.env.BEDROCK_MODEL_ID    ?? 'deepseek.v3.2',
      region:      process.env.BEDROCK_AWS_REGION  ?? 'eu-north-1',
      temperature: 0,
      maxTokens:   5000,
    });
  }

  async summarize(state: WorkflowState): Promise<Report> {
    console.log('[SynthesizerNode] Building final report...');

    const context = JSON.stringify(
      {
        vulnerabilities: state.vulnerabilitiesReport,
        coverage:        state.coverageReport,
        dependencies:    state.depsReport,
        documentation:   state.docsReport,
        languages:       state.languageBreakdown,
      },
      null,
      2,
    );

    let reportSummary: ReportSummary;

    try {
      const response = await this.createModel().invoke([
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

      const raw = (response.content as string).replace(/```json|```/g, '').trim();
      reportSummary = JSON.parse(raw) as ReportSummary;

      console.log(`[SynthesizerNode] Summary generated. Mark: ${reportSummary.mark}/10`);
    } catch (error) {
      console.error('[SynthesizerNode] AI summary failed, using fallback.', error);
      reportSummary = {
        summary: 'Analisi completata. Consultare i dati dettagliati per i risultati completi.',
        mark:    5,
      };
    }

    const report: Report = {
      summary: reportSummary,
      data: {
        depsReport:            state.depsReport            ?? { report: [] },
        vulnerabilitiesReport: state.vulnerabilitiesReport ?? { report: [] },
        docsReport:            state.docsReport            ?? { readmeReport: { analysis: { analysis: '' } }, commentReport: [], mark: 0 },
        coverageReport:        state.coverageReport        ?? { statementsReport: 0, branchesReport: 0, functionsReport: 0, linesReport: 0 },
      },
      metadata: {
        startScanTime: state.startScanTime,
        endScanTime:   new Date(),
        target:        state.target,
      },
    };

    console.log('[SynthesizerNode] Report built successfully.');
    return report;
  }
}
