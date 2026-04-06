import { Injectable } from '@nestjs/common';
import path from 'path';
import { mkdir } from 'fs/promises';
import { WorkflowState } from '../orchestrator.service';
import { SecurityNodeHelper } from './security-node.helper';

@Injectable()
export class SecurityNodeService {
  constructor(private readonly helper: SecurityNodeHelper) {}

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    const reportPath = this.helper.buildReportPath(path.basename(repoPath));

    console.log(`[SecurityNode] Starting Semgrep scan on: ${repoPath}`);

    await mkdir(path.dirname(reportPath), { recursive: true });

    if (!(await this.helper.isSemgrepInstalled())) {
      console.error('[Security Node] Semgrep not installed.');
      return {};
    }

    try {
      await this.helper.executeSemgrep(repoPath, reportPath);
      const units = await this.helper.parseResults(reportPath);
      const mark = this.helper.getMark(units);
      console.log(`[SecurityNode] Voto sicurezza: ${mark}`);
      return {
        vulnerabilitiesReport: { vulnerabilities: units, mark },
        vulnerabilitiesReportPath: reportPath,
      };
    } catch (error) {
      console.error('[SecurityNode] Semgrep execution failed.', error);
      return {};
    }
  }
}
