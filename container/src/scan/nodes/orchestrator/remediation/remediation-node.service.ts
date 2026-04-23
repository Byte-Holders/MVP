import { Injectable, Logger } from '@nestjs/common';
import { access, readFile } from 'fs/promises';
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

    const vulnerabilityMap = this.helper.groupResultsByFile(
      rawJson.results as { path: string; check_id: string }[],
    );

    await Promise.all(
      [...vulnerabilityMap.entries()].map(async ([filePath, results]) => {
        const fileContent = await this.helper.readFileContent(filePath);
        if (!fileContent) return;
        try {
          const remediations = await this.helper.generateRemediations(
            filePath,
            results,
            fileContent,
            model,
          );
          this.helper.applyRemediations(vulnerabilities, remediations);

          this.logger.log(
            `Risolte ${remediations.length} vulnerabilità in ${filePath}`,
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
