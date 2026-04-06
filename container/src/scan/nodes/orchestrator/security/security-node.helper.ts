import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { readFile } from 'fs/promises';
import { VulnerabilityUnit } from './security-report.type';
import { executeCli, type CliCommand } from '../../../exec.cli';

type SemgrepResult = {
  results: {
    check_id: string;
    extra: {
      message: string;
      severity: string;
      metadata: SemgrepMetadata;
    };
  }[];
};

type SemgrepMetadata = {
  category: string;
  cwe: string[];
  owasp: string[];
};

@Injectable()
export class SecurityNodeHelper {
  private readonly logger = new Logger(SecurityNodeHelper.name);

  buildReportPath(repoName: string): string {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    return path.resolve(`./reports/${repoName}/scan_${dateStr}.json`);
  }

  async isSemgrepInstalled(): Promise<boolean> {
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

  async executeSemgrep(repoPath: string, reportPath: string): Promise<void> {
    const command: CliCommand = {
      name: 'semgrep',
      args: [
        `scan`,
        `${repoPath}`,
        `--config`,
        `auto`,
        `--json`,
        `--output`,
        `${reportPath}`,
        `--exclude=node_modules`,
        `--exclude=reports`,
        `--exclude=dist`,
        `--quiet`,
        `--no-git-ignore`,
      ],
    };

    await executeCli(command);
    console.log(`[SecurityNode] Report saved to: ${reportPath}`);
  }

  async parseResults(reportPath: string): Promise<VulnerabilityUnit[]> {
    const raw = await readFile(reportPath, 'utf-8');
    const json = JSON.parse(raw) as SemgrepResult;

    return (json.results ?? []).map((r) => ({
      id: r.check_id ?? 'unknown',
      description: r.extra?.message ?? '',
      remediation: '',
      severity: this.parseSeverity(r.extra?.severity),
      category: r.extra?.metadata.category,
      cwe: r.extra?.metadata.cwe,
      owasp: r.extra?.metadata.owasp,
    }));
  }

  parseSeverity(raw?: string): number {
    const map: Record<string, number> = { INFO: 10, WARNING: 5, ERROR: 0 };
    return map[raw?.toUpperCase() ?? ''] ?? 0;
  }

  getMark(vulnerabilities: VulnerabilityUnit[]): number {
    type MarkInformation = {
      severity: number;
      count: number;
    };
    const sum = vulnerabilities
      .map((vuln) => {
        return { severity: vuln.severity, count: vuln.severity ? 1 : 0 };
      })
      .reduce(
        (prev: MarkInformation, next: MarkInformation) => {
          return {
            severity: prev.severity + next.severity,
            count: prev.count + next.count,
          };
        },
        {
          severity: 0,
          count: 0,
        },
      );

    if (sum.count != 0) return sum.severity / sum.count;
    else return 10;
  }
}
