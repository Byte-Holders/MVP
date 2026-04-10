import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import { mkdir } from 'fs/promises';
import { WorkflowState } from '../workflow-state.type';
import { SecurityNodeHelper } from './security-node.helper';
import { INodeScanService } from '../inode-scan-service.interface';

export const SECURITY_NODE_SERVICE_TOKEN = 'SecurityNodeService';

@Injectable()
export class SecurityNodeService implements INodeScanService {
  private readonly logger = new Logger(SecurityNodeService.name);

  constructor(private readonly helper: SecurityNodeHelper) {}

  async scan({
    repoPath,
  }: {
    repoPath: string;
  }): Promise<Partial<WorkflowState>> {
    const reportPath = this.helper.buildReportPath(path.basename(repoPath));

    this.logger.log(`Inizio analisi sulla sicurezza: ${repoPath}`);

    await mkdir(path.dirname(reportPath), { recursive: true });

    if (!(await this.helper.isSemgrepInstalled())) {
      this.logger.error('Semgrep non è stato installato.');
      return {};
    }

    try {
      await this.helper.executeSemgrep(repoPath, reportPath);
      const units = await this.helper.parseResults(reportPath);
      const mark = this.helper.getMark(units);
      this.logger.log(`Analisi della sicurezza terminato. Voto: ${mark}`);
      return {
        vulnerabilitiesReport: { vulnerabilities: units, mark },
        vulnerabilitiesReportPath: reportPath,
      };
    } catch (error) {
      this.logger.error(`Errore durante esecuzione semgrep: ${error}`);
      return {};
    }
  }
}
