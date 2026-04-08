import { Injectable } from '@nestjs/common';
import { CoverageReport } from './coverage-report.type';
import { CliCommand, executeCli } from '../../../exec.cli';

@Injectable()
export class CoverageNodeHelper {
  async runCoverageTool(targetPath: string): Promise<string> {
    const command: CliCommand = {
      name: 'sh',
      args: [
        '-c',
        `cd "${targetPath}" && npm install --silent && npx jest --coverage --coverageReporters="text-summary" 2>&1 | grep -E "Statements|Branches|Functions|Lines"`,
      ],
    };

    const executionResult = await executeCli(command);

    return executionResult;
  }

  parseOutput(split: string[]): CoverageReport {
    const report: CoverageReport = {
      statements: parseFloat(split[0]),
      branches: parseFloat(split[1]),
      functions: parseFloat(split[2]),
      lines: parseFloat(split[3]),
    };

    return report;
  }

  splitResult(result: string): string[] {
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
