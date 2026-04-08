import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CoverageReport } from './coverage-report.type';
import { WorkflowState } from '../orchestrator.service';
import { CoverageNodeHelper } from './coverage-node.helper';

@Injectable()
export class CoverageNodeService {
  private readonly logger = new Logger(CoverageNodeService.name);

  constructor(private readonly helper: CoverageNodeHelper) {}

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    this.logger.log(
      `[CoverageNode] Inizio analisi coverage (percorso: ${repoPath})`,
    );

    let report: CoverageReport = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    };

    try {
      if (fs.existsSync(path.join(repoPath, 'package.json'))) {
        const output = await this.helper.runCoverageTool(repoPath);
        const split = this.helper.splitResult(output);
        report = this.helper.parseOutput(split);
        this.logger.log('Terminata coverage');
        this.logger.debug(JSON.stringify(report, null, 2));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`Fallimento coverage: ${err.message}`);
      } else {
        this.logger.error('Fallimento coverage, tipo di errore sconosciuto.');
      }
    }
    return { coverageReport: report };
  }
}
