import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TestReport } from './coverage-report.type';
import { WorkflowState } from '../workflow-state.type';
import { CoverageNodeHelper } from './coverage-node.helper';
import { INodeScanService } from '../inode-scan-service.interface';

export const COVERAGE_NODE_SERVICE_TOKEN = 'CoverageNodeService';

@Injectable()
export class CoverageNodeService implements INodeScanService {
  private readonly logger = new Logger(CoverageNodeService.name);

  constructor(private readonly helper: CoverageNodeHelper) {}

  async scan({
    repoPath,
  }: {
    repoPath: string;
  }): Promise<Partial<WorkflowState>> {
    this.logger.log(
      `[CoverageNode] Inizio analisi coverage (percorso: ${repoPath})`,
    );

    let testReport: TestReport = {
      coverageReport: { statements: 0, branches: 0, functions: 0, lines: 0 },
      failedTests: [],
      testsRun: 0,
    };

    try {
      if (fs.existsSync(path.join(repoPath, 'package.json'))) {
        const { stdout, resultsPath } =
          await this.helper.runCoverageTool(repoPath);

        try {
          const split = this.helper.splitResult(stdout);
          const coverageReport = this.helper.parseOutput(split);
          const { failedTests, testsRun } =
            this.helper.parseTestResults(resultsPath);
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
}
