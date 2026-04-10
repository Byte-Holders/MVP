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

  async scan(vulnerabilitiesReport: {
    vulnerabilities: VulnerabilitiesReport | null | undefined;
    vulnerabilitiesReportPath?: string;
  }): Promise<Partial<WorkflowState>> {
    const semgrepReportPath = vulnerabilitiesReport.vulnerabilitiesReportPath;

    if (!semgrepReportPath) {
      this.logger.warn('Non è stato generato un report da semgrep');
      return {};
    }

    this.logger.log(
      `Generazione remediation per ${vulnerabilitiesReport.vulnerabilities?.vulnerabilities?.length} vulneraibilità`,
    );

    try {
      await access(semgrepReportPath);
    } catch (e: unknown) {
      this.logger.error(
        `Errore accesso a report di semgrep: ${(e as Error).message}`,
      );
      return {};
    }

    const rawJson = JSON.parse(await readFile(semgrepReportPath, 'utf-8')) as {
      results?: { path: string }[];
    };

    if (!rawJson.results?.length) {
      this.logger.log('Nessuna vulnerabilità da risolvere');
      return {
        vulnerabilitiesReport: {
          vulnerabilities: [],
          mark: vulnerabilitiesReport.vulnerabilities?.mark ?? 10,
        },
      };
    }

    const model = this.helper.createModel();
    const vulnerabilities: VulnerabilityUnit[] = [
      ...(vulnerabilitiesReport?.vulnerabilities?.vulnerabilities ?? []),
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
                        [{ "id": "<check_id>", "remediation": "<spiegazione max 100 parole che prevede un prima e dopo correzione>" }]
                        Rispondi SOLO con il JSON array, senza markdown.`,
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
        vulnerabilities: vulnerabilities,
        mark: vulnerabilitiesReport.vulnerabilities?.mark ?? 10,
      },
    };
  }
}
