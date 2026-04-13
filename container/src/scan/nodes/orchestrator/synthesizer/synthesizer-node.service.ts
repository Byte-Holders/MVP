import { Injectable, Logger } from '@nestjs/common';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { Report, ReportSummary } from './synthesizer.types';
import { WorkflowState } from '../workflow-state.type';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';

@Injectable()
export class SynthesizerNodeService {
  private readonly logger = new Logger(SynthesizerNodeService.name);

  constructor(private readonly helper: SynthesizerNodeHelper) {}

  async summarize(state: WorkflowState): Promise<Report> {
    this.logger.log('Inizio costruzione report finale');

    const context = JSON.stringify(
      {
        vulnerabilities: state.vulnerabilitiesReport,
        testReport: state.testReport,
        documentation: state.docsReport,
        languages: state.languages,
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

      this.logger.debug(`Generato riassunto. Voto: ${reportSummary.mark}/10`);
    } catch (error) {
      this.logger.error(`Errore durante riassunzione report. Piano B.`, error);
      reportSummary = {
        summary: `C'è stato un errore durante la generazione del riassunto del report generato.`,
        mark: 1,
      };
    }

    const report: Report = {
      summary: reportSummary,
      data: {
        depsReport: state.depsReport ?? {
          list: [],
          libraries: [],
          frameworks: [],
          vulnerabilities: [],
          vulnerabilityAnalysis: '',
        },
        vulnerabilitiesReport: state.vulnerabilitiesReport ?? {
          vulnerabilities: [],
          mark: 10,
        },
        docsReport: state.docsReport ?? {
          readmeReport: '',
          commentReport: '',
          mark: 0,
        },
        testReport: state.testReport ?? {
          coverageReport: {
            statements: 0,
            branches: 0,
            functions: 0,
            lines: 0,
          },
          failedTests: [],
          testsRun: 0,
        },
        languages: state.languages ?? [],
        codeQualityReport: state.codeQualityReport ?? {
          analysis: [],
          mark: 0,
        },
      },
      metadata: {
        startScanTime: state.startScanTime,
        endScanTime: new Date(),
        target: state.target,
      },
    };

    this.logger.log('Terminata costruzione del report');
    return report;
  }
}
