import { Injectable } from '@nestjs/common';
import { access, readFile } from 'fs/promises';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { VulnerabilityUnit } from '../security/security-report.type';
import { WorkflowState } from '../orchestrator/orchestrator.service';
import { RemediationNodeHelper } from './remediation-node.helper';

@Injectable()
export class RemediationNodeService {
  constructor(private readonly helper: RemediationNodeHelper) {}

  async scan(vulnerabilitiesReport: {
    vulnerabilities?: VulnerabilityUnit[];
    vulnerabilitiesReportPath?: string;
  }): Promise<Partial<WorkflowState>> {
    const semgrepReportPath = vulnerabilitiesReport.vulnerabilitiesReportPath;

    console.log(
      `[RemediationNode] Generating remediations for ${vulnerabilitiesReport.vulnerabilities?.length} vulnerabilities found at ${vulnerabilitiesReport.vulnerabilitiesReportPath}`,
    );

    if (!semgrepReportPath) {
      console.warn('[RemediationNode] No Semgrep report found, skipping.');
      return {};
    }

    try {
      await access(semgrepReportPath);
    } catch (e: unknown) {
      console.warn(
        `[RemediationNode] Error accessing semgrep report: ${(e as Error).message}.`,
      );
      return {};
    }

    const rawJson = JSON.parse(await readFile(semgrepReportPath, 'utf-8')) as {
      results?: { path: string }[];
    };

    if (!rawJson.results?.length) {
      console.log('[RemediationNode] No vulnerabilities to remediate.');
      return {};
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
          console.warn(
            `[RemediationNode] Cannot read file: ${filePath}, skipping.`,
          );
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

          console.log(
            `[RemediationNode] Remediated ${parsed.length} vulnerabilities in ${filePath}`,
          );
        } catch (error) {
          console.error(
            `[RemediationNode] AI remediation failed for ${filePath}`,
            error,
          );
        }
      }),
    );

    return {
      vulnerabilitiesReport: { vulnerabilities: vulnerabilities },
    };
  }
}
