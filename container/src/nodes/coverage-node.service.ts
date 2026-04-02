import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CoverageReport } from '../types';
import { WorkflowState } from '../orchestrator.service';
import { CliCommand, executeCli } from './exec.cli';

@Injectable()
export class CoverageNodeService {
  constructor() {}

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    console.log(`[CoverageNode] Starting test coverage in: ${repoPath}`);

    let report: CoverageReport = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    };

    try {
      if (fs.existsSync(path.join(repoPath, 'package.json')))
        report = await this.runCoverageTool(repoPath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`[CoverageNode] Coverage failed: ${err.message}`);
      } else {
        console.error('[CoverageNode] Coverage failed, continuing anyway.');
      }
    }
    return { coverageReport: report };
  }

  private async runCoverageTool(targetPath: string): Promise<CoverageReport> {
    try {
      const command: CliCommand = {
        name: 'sh',
        args: [
          '-c',
          `cd "${targetPath}" && npm install --silent && npx jest --coverage --coverageReporters="text-summary" 2>&1 | grep -E "Statements|Branches|Functions|Lines"`,
        ],
      };

      const executionResult = await executeCli(command);
      console.log(
        `[CoverageNode] Esecuzione comando: ${command.name} ${command.args?.join(' ')}}`,
      );

      return this.parseOutput(executionResult);
    } catch (err: unknown) {
      throw new Error(
        `Errore durante esecuzione coverage: ${(err as Error).message})`,
      );
    }
  }

  private parseOutput(output: string): CoverageReport {
    const split: string[] = this.splitResult(output);

    const report: CoverageReport = {
      statements: parseFloat(split[0]),
      branches: parseFloat(split[1]),
      functions: parseFloat(split[2]),
      lines: parseFloat(split[3]),
    };

    return report;
  }

  private splitResult(result: string): string[] {
    const split = result
      .split('\n')
      .filter(
        (line) => line.match(/(Statements|Branches|Functions|Lines)/) != null,
      )
      .join('\n')
      .replaceAll(/% *\(\s*\d+\/\d+\s*\) */g, '')
      .replaceAll(/(Statements|Branches|Functions|Lines)\s*:\s*/g, '')
      .split('\n')
      .map((line) => line.trim());

    if (split.length != 4) {
      throw new Error(`Errore lettura parametro: ${split.toString()}`);
    }

    return split;
  }
}
