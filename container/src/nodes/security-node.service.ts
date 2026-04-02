import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { mkdir } from 'fs/promises';
import { readFile } from 'fs/promises';
import { VulnerabilityUnit } from '../types';
import { WorkflowState } from '../orchestrator.service';

@Injectable()
export class SecurityNodeService {
  private readonly logger = new Logger(SecurityNodeService.name);

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    const reportPath = this.buildReportPath(path.basename(repoPath));

    console.log(`[SecurityNode] Starting Semgrep scan on: ${repoPath}`);

    await mkdir(path.dirname(reportPath), { recursive: true });

    if (!(await this.isSemgrepInstalled())) {
      console.error('[Security Node] Semgrep not installed.');
      return {};
    }

    try {
      await this.executeSemgrep(repoPath, reportPath);
      const units = await this.parseResults(reportPath);
      return {
        vulnerabilitiesReport: { vulnerabilities: units },
        vulnerabilitiesReportPath: reportPath,
      };
    } catch (error) {
      console.error('[SecurityNode] Semgrep execution failed.', error);
      return {};
    }
  }

  private buildReportPath(repoName: string): string {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    return path.resolve(`./reports/${repoName}/scan_${dateStr}.json`);
  }

  private async isSemgrepInstalled(): Promise<boolean> {
    const execAsync = promisify(exec);
    try {
      const { stdout } = await execAsync('semgrep --version');
      console.log(`[SecurityNode] Semgrep version: ${stdout.trim()}`);
      return true;
    } catch {
      console.error('[SecurityNode] Semgrep not found in PATH.');
      return false;
    }
  }

  private async executeSemgrep(
    repoPath: string,
    reportPath: string,
  ): Promise<void> {
    const execAsync = promisify(exec);
    await execAsync(
      `semgrep scan ${repoPath} --config auto --json --output ${reportPath} ` +
        `--exclude=node_modules --exclude=reports --exclude=dist --quiet --no-git-ignore`,
    );
    console.log(`[SecurityNode] Report saved to: ${reportPath}`);
  }

  private async parseResults(reportPath: string): Promise<VulnerabilityUnit[]> {
    const raw = await readFile(reportPath, 'utf-8');
    const json = JSON.parse(raw);
    return (json.results ?? []).map((r: any) => ({
      id: r.check_id ?? 'unknown',
      description: r.extra?.message ?? '',
      remediation: '',
      severity: this.parseSeverity(r.extra?.severity),
    }));
  }

  private parseSeverity(raw?: string): number {
    const map: Record<string, number> = { INFO: 1, WARNING: 2, ERROR: 3 };
    return map[raw?.toUpperCase() ?? ''] ?? 0;
  }
}
