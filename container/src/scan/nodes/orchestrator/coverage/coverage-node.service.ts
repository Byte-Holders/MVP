import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CoverageReport } from './coverage-report.type';
import { WorkflowState } from '../orchestrator.service';
import { CoverageNodeHelper } from './coverage-node.helper';

@Injectable()
export class CoverageNodeService {
  constructor(private readonly helper: CoverageNodeHelper) {}

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
        report = await this.helper.runCoverageTool(repoPath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`[CoverageNode] Coverage failed: ${err.message}`);
      } else {
        console.error('[CoverageNode] Coverage failed, continuing anyway.');
      }
    }
    return { coverageReport: report };
  }
}
