import { Injectable, Logger } from '@nestjs/common';
import { access, readFile } from 'fs/promises';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import {
  VulnerabilitiesReport,
  VulnerabilityUnit,
} from '../security/security-report.type';
import { WorkflowState } from '../workflow-state.type';
import { RemediationNodeHelper } from './remediation-node.helper';
import { INodeScanService } from '../inode-scan-service.interface';

export const REMEDIATION_NODE_SERVICE_TOKEN = 'RemediationNodeService';

@Injectable()
export class RemediationNodeService implements INodeScanService {
  private readonly logger = new Logger(RemediationNodeService.name);

  constructor(private readonly helper: RemediationNodeHelper) {}

  async scan({
    vulnerabilitiesReport,
    vulnerabilitiesReportPath,
  }: {
    vulnerabilitiesReport: VulnerabilitiesReport | null | undefined;
    vulnerabilitiesReportPath?: string;
  }): Promise<Partial<WorkflowState>> {
    if (
      !vulnerabilitiesReportPath ||
      vulnerabilitiesReport?.vulnerabilities.length == 0
    ) {
      this.logger.warn('Non è stato generato un report da semgrep');
      return {};
    }

    this.logger.log(
      `Generazione remediation per ${vulnerabilitiesReport?.vulnerabilities?.length} vulnerabilità`,
    );

    try {
      await access(vulnerabilitiesReportPath);
    } catch (e: unknown) {
      this.logger.error(
        `Errore accesso a report di semgrep: ${(e as Error).message}`,
      );
      return {};
    }

    const rawJson = JSON.parse(
      await readFile(vulnerabilitiesReportPath, 'utf-8'),
    ) as {
      results?: { path: string }[];
    };

    if (!rawJson.results?.length) {
      this.logger.log('Nessuna vulnerabilità da risolvere');
      return {
        vulnerabilitiesReport: {
          vulnerabilities: [],
          mark: vulnerabilitiesReport?.mark ?? 10,
        },
      };
    }

    const model = this.helper.createModel();
    const vulnerabilities: VulnerabilityUnit[] = [
      ...(vulnerabilitiesReport?.vulnerabilities ?? []),
    ];

    // Raggruppa i risultati semgrep per file, in poche parole metto in result tutti i file presenti in almeno una vulnerabilita, se un file e' presente in piu di 1 vulnerabilita lo passo cmq 1 sola volta
    const vulnerabilityMap = new Map<string, any[]>();
    for (const result of rawJson.results) {
      const filePath: string = result.path;

      if (!vulnerabilityMap.has(filePath)) vulnerabilityMap.set(filePath, []);

      vulnerabilityMap.get(filePath)!.push(result);
    }

    // Processa ogni file in parallelo
    await Promise.all(
      [...vulnerabilityMap.entries()].map(async ([filePath, results]) => {
        let fileContent: string;
        try {
          fileContent = await readFile(filePath, 'utf-8');
        } catch {
          this.logger.warn(`Errore lettura file: ${filePath}`);
          return;
        }

        try {
          const response = await model.invoke([
            new SystemMessage(
              `Sei un esperto di sicurezza del software. Analizza le vulnerabilità Semgrep fornite e restituisci un JSON array di oggetti, uno per ogni vulnerabilità:
                [{ "id": "<check_id>", "remediation": "<descrizione>" }]
                Il campo <descrizione> deve essere di tipo STRING e markdown VALIDO e strutturato come segue:\n\n
                - **Esempio:** esempio che può portare alla vulnerabilità rilevata. Dedica massimo 300 caratteri per questo punto.\n\n
                - **Remediation:** le azioni da intraprendere per risolvere la vulnerabilità, se possibile. In caso contrario, come tale vulnerabilità può essere alleviata. Dedica massimo 100 parole per questo punto.\n\n
                - **Conseguenze:** un esempio pratico, di massimo 100 parole, di cosa può succedere in caso di mancata risoluzione della vulnerabilità. Dedica massimo 50 parole per questo punto.

                Tutti e 3 i punti appena citati devono essere il valore associato alla chiave "remediation".

                Rispondi SOLO con il JSON array.
                Assicurati che il markdown all'interno del campo "remediation" sia valido.
                Assicurati che il valore associato al campo "remediation" sia di tipo string.
                Non restituire altro oltre all'array.
                Non commentare il risultato.
                `,
            ),
            new HumanMessage(
              `Vulnerabilità trovate in ${filePath}:\n${JSON.stringify(results, null, 2)}\n\nContenuto del file:\n${fileContent}`,
            ),
          ]);

          const content = (response.content as string)
            .replace(/```json|```/g, '')
            .trim();

          const parsed = JSON.parse(content) as {
            id: string;
            remediation: string;
          }[];

          for (const fix of parsed) {
            const unit = vulnerabilities.find((u) => u.id === fix.id);
            if (unit) unit.remediation = fix.remediation;
          }

          this.logger.log(
            `Risolte ${parsed.length} vulnerabilità in ${filePath}`,
          );
        } catch (error) {
          this.logger.error(
            `Errore risoluzione vulnerabilità in ${filePath}`,
            error,
          );
        }
      }),
    );

    return {
      vulnerabilitiesReport: {
        vulnerabilities,
        mark: vulnerabilitiesReport?.mark ?? 10,
      },
    };
  }
}
