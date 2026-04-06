import { Injectable, Logger } from '@nestjs/common';
import { DepsReport } from './deps-report.type';
import { WorkflowState } from '../orchestrator.service';
import { executeCli, type CliCommand } from '../../../exec.cli';

@Injectable()
export class DepsNodeService {
  private readonly logger = new Logger(DepsNodeService.name);

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    this.logger.log(`Inizio analsi delle dipendenze in: ${repoPath}`);

    try {
      const command: CliCommand = {
        name: 'syft',
        args: [`dir:${repoPath}`, `-o`, `json`, `-q`],
      };

      const raw = (await executeCli(command)).toString().trim();

      const report = JSON.parse(raw) as {
        artifacts: { name: string; version: string }[];
      };

      const depsReport: DepsReport = {
        report: report.artifacts.map((dep) => ({
          name: dep.name,
          version: dep.version,
        })),
      };

      this.logger.log(`Trovate ${report.artifacts.length} dipendenze.`);

      return { depsReport };
    } catch (error: unknown) {
      this.logger.error(
        `Analisi delle dipendenze fallita. ${(error as Error).message}`,
      );
      return { depsReport: { report: [] } };
    }
  }
}
