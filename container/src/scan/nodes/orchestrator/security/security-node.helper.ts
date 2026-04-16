import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { readFile } from 'fs/promises';
import { VulnerabilityUnit } from './security-report.type';
import { executeCli, type CliCommand } from '../../../exec.cli';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatBedrockConverse } from '@langchain/aws';

type SemgrepResult = {
  results: {
    check_id: string;
    path: string;
    extra: {
      message: string;
      severity: string;
      metadata: SemgrepMetadata;
    };
  }[];
};

type SemgrepMetadata = {
  category: string;
  cwe: string | string[];
  owasp: string[];
  impact?: string;
};

@Injectable()
export class SecurityNodeHelper {
  private readonly logger = new Logger(SecurityNodeHelper.name);

  createModel() {
    return new ChatBedrockConverse({
      model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
      region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
      temperature: 0,
      maxTokens: 5000,
    });
  }

  buildReportPath(repoName: string): string {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    return path.resolve(`./reports/${repoName}/scan_${dateStr}.json`);
  }

  async isSemgrepInstalled(): Promise<boolean> {
    const execAsync = promisify(exec);
    try {
      const { stdout } = await execAsync('semgrep --version');
      this.logger.debug(`Versione semgrep: ${stdout.trim()}`);
      return true;
    } catch {
      this.logger.error('Semgrep non è stato trovato in PATH');
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
    this.logger.debug(`[SecurityNode] Report saved to: ${reportPath}`);
  }

  async parseResults(reportPath: string): Promise<VulnerabilityUnit[]> {
    const raw = await readFile(reportPath, 'utf-8');
    const json = JSON.parse(raw) as SemgrepResult;

    return (json.results ?? []).map((r) => ({
      id: r.check_id ?? 'unknown',
      path: r.path ?? '',
      description: r.extra?.message ?? '',
      remediation: '',
      severity: this.parseSeverity(r.extra?.severity),
      impact: r.extra?.metadata?.impact ?? '',
      category: r.extra?.metadata?.category ?? '',
      cwe:
        typeof r.extra?.metadata?.cwe === 'string'
          ? r.extra?.metadata?.cwe
          : r.extra?.metadata?.cwe[0],
      owasp: r.extra?.metadata?.owasp ?? [],
    }));
  }

  async translateDescriptions(units: VulnerabilityUnit[]): Promise<VulnerabilityUnit[]> {
    if (units.length === 0) return units;

    this.logger.log(`Traduzione di ${units.length} descrizioni in corso...`);

    const descriptionsMap = units.reduce((acc, unit, index) => {
      if (unit.description) acc[index] = unit.description;
      return acc;
    }, {} as Record<number, string>);

    const model = this.createModel();

    try {
      const response = await model.invoke([
        new SystemMessage(
            `Sei un esperto di sicurezza. Traduci in italiano le descrizioni delle vulnerabilità fornite nel JSON. 
           Mantieni le chiavi numeriche originali. Rispondi SOLO con il JSON del dizionario tradotto, senza markdown.`
        ),
        new HumanMessage(JSON.stringify(descriptionsMap)),
      ]);

      const content = (response.content as string)
          .replace(/```json|```/g, '')
          .trim();

      const translatedMap = JSON.parse(content) as Record<string, string>;

      // Rimappatura delle traduzioni nell'array originale
      return units.map((unit, index) => ({
        ...unit,
        description: translatedMap[index.toString()] ?? unit.description,
      }));
    } catch (error) {
      this.logger.error('Errore durante la traduzione LLM, mantengo i testi originali', error);
      return units;
    }
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
