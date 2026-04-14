import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { CoverageReport, FailedTest } from './coverage-report.type';
import { CliCommand, executeCli } from '../../../exec.cli';

@Injectable()
export class CoverageNodeHelper {
  async runCoverageTool(
    targetPath: string,
  ): Promise<{ stdout: string; resultsPath: string }> {
    const resultsPath = path.join(
      os.tmpdir(),
      `jest-results-${Date.now()}.json`,
    );
    const command: CliCommand = {
      name: 'sh',
      args: [
        '-c',
        `cd "${targetPath}" && npm install --silent && npx jest --coverage --coverageReporters="text-summary" --json --outputFile="${resultsPath}" 2>&1`,
      ],
    };
    const stdout = await executeCli(command);
    return { stdout, resultsPath };
  }

  parseOutput(split: string[]): CoverageReport {
    return {
      statements: parseFloat(split[0]),
      branches: parseFloat(split[1]),
      functions: parseFloat(split[2]),
      lines: parseFloat(split[3]),
    };
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

  parseTestResults(resultsPath: string): {
    failedTests: FailedTest[];
    testsRun: number;
  } {
    try {
      const raw = fs.readFileSync(resultsPath, 'utf-8');
      const json = JSON.parse(raw) as {
        numTotalTests: number;
        testResults: {
          testFilePath: string;
          testResults: {
            title: string;
            status: string;
            failureMessages: string[];
          }[];
        }[];
      };

      const failedTests: FailedTest[] = [];
      for (const suite of json.testResults ?? []) {
        for (const test of suite.testResults ?? []) {
          if (test.status === 'failed') {
            failedTests.push({
              name: test.title,
              path: suite.testFilePath,
              messageSummary: test.failureMessages?.[0]?.slice(0, 200) ?? '',
            });
          }
        }
      }

      return { failedTests, testsRun: json.numTotalTests ?? 0 };
    } catch {
      return { failedTests: [], testsRun: 0 };
    }
  }
}
