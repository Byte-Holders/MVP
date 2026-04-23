import { Injectable, Logger } from '@nestjs/common';
import { ChatBedrockConverse } from '@langchain/aws';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { Report, ReportSummary } from './synthesizer.types';
import { WorkflowState } from '../workflow-state.type';

@Injectable()
export class SynthesizerNodeHelper {
  private readonly logger = new Logger(SynthesizerNodeHelper.name);

  createModel() {
    return new ChatBedrockConverse({
      model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
      region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
      temperature: 0,
      maxTokens: 5000,
    });
  }

  async generateReportSummary(state: WorkflowState): Promise<ReportSummary> {
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

    try {
      const response = await this.createModel().invoke([
        new SystemMessage(
          `Sei un tech lead esperto. Ricevi i risultati aggregati dell'analisi di una repository (sicurezza, coverage, dipendenze, documentazione).
Restituisci SOLO un JSON con questa struttura, senza markdown:
{
  "summary": "<riassunto discorsivo>",
  "mark": <voto>
}
Il <riassunto discorsivo> deve essere markdown VALIDO, dunque deve avere tipo string, e fornire una panoramica dei risultati ricevuti, senza andare nel tecnico o fare riferimento alla logica interna del
prodotto analizzato.
Il <voto> deve essere un valore intero compreso tra 0 e 10, che corrisponda alla media tra il voto della documentazione e della sicurezza, pesato su una scala da 0 a 6, e la code coverage presente
nell'analisi dei test, in cui una coverage del 100% su ogni valore vale 4 punti, mentre ciascuna delle quattro metriche (statements, branches, functions, lines) inferiore al 70% causa la perdita di un punto.
Assicurati di restituire un JSON valido, e solo un JSON valido.`,
        ),
        new HumanMessage(`Dati analisi:\n${context}`),
      ]);

      const raw = (response.content as string)
        .replace(/```json|```/g, '')
        .trim();
      const reportSummary = JSON.parse(raw) as ReportSummary;

      this.logger.debug(`Generato riassunto. Voto: ${reportSummary.mark}/10`);
      return reportSummary;
    } catch (error) {
      this.logger.error(`Errore durante riassunzione report. Piano B.`, error);
      return {
        summary: `C'è stato un errore durante la generazione del riassunto del report generato.`,
        mark: 1,
      };
    }
  }

  assembleReport(state: WorkflowState, summary: ReportSummary): Report {
    // `list` è là solamente per essere tirata fuori dal report finale quindi non è utilizzata
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { libraries, frameworks, list, ...depsReport } = state.depsReport ?? {
      list: [],
      libraries: [],
      frameworks: [],
      vulnerabilities: [],
      vulnerabilityAnalysis: '',
    };

    return {
      summary,
      data: {
        depsReport,
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
        techReport: {
          libraries,
          frameworks,
          languages: state.languages ?? [],
        },
      },
      metadata: {
        startScanTime: state.startScanTime,
        endScanTime: new Date(),
        target: state.target,
      },
    };
  }
}
