import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CoverageReport, FailedTest, TestReport } from './coverage-report.type';
import { WorkflowState } from '../workflow-state.type';
import { CoverageNodeHelper } from './coverage-node.helper';
import { INodeScanService } from '../inode-scan-service.interface';

export const COVERAGE_NODE_SERVICE_TOKEN = 'CoverageNodeService';

type CoverageNodeResult = { testReport: TestReport };

@Injectable()
export class CoverageNodeService implements INodeScanService {
  private readonly logger = new Logger(CoverageNodeService.name);

  constructor(private readonly helper: CoverageNodeHelper) {}

  async scan({ repoPath }: { repoPath: string }): Promise<CoverageNodeResult> {
    this.logger.log(`Inizio analisi coverage (percorso: ${repoPath})`);

    let testReport: TestReport = {
      coverageReport: { statements: 0, branches: 0, functions: 0, lines: 0 },
      failedTests: [],
      testsRun: 0,
    };

    try {
      if (this.helper.checkFileExists(path.join(repoPath, 'package.json'))) {
        const { stdout, resultsPath } =
          await this.helper.runCoverageTool(repoPath);

        try {
          const split = this.splitResult(stdout);
          const coverageReport = this.parseOutput(split);
          const { failedTests, testsRun } = this.parseTestResults(resultsPath);
          testReport = { coverageReport, failedTests, testsRun };
          this.logger.log('Terminata coverage');
          this.logger.debug(JSON.stringify(testReport, null, 2));
        } finally {
          if (fs.existsSync(resultsPath)) {
            fs.unlinkSync(resultsPath);
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`Fallimento coverage: ${err.message}`);
      } else {
        this.logger.error('Fallimento coverage, tipo di errore sconosciuto.');
      }
    }

    return { testReport };
  }

  private parseOutput(split: string[]): CoverageReport {
    return {
      statements: parseFloat(split[0]) || 0,
      branches: parseFloat(split[1]) || 0,
      functions: parseFloat(split[2]) || 0,
      lines: parseFloat(split[3]) || 0,
    };
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

  private parseTestResults(resultsPath: string): {
    failedTests: FailedTest[];
    testsRun: number;
  } {
    try {
      const raw = this.helper.getFileContentsRaw(resultsPath);
      const sanitized = raw.replace(/[^\t\n\r -~]/g, '');
      const json = JSON.parse(sanitized) as {
        numTotalTests: number;
        testResults: {
          name: string;
          assertionResults: {
            fullName: string;
            status: string;
            failureMessages: string[];
          }[];
        }[];
      };

      const failedTests: FailedTest[] = [];
      for (const suite of json.testResults) {
        for (const test of suite.assertionResults) {
          if (test.status === 'failed') {
            failedTests.push({
              name: test.fullName,
              path: suite.name,
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
