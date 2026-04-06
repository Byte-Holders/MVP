import { Injectable } from '@nestjs/common';
import { DepsReport } from './deps-report.type';
import { WorkflowState } from '../orchestrator.service';
import { executeCli, type CliCommand } from '../../../exec.cli';

@Injectable()
export class DepsNodeService {
  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    console.log(`[DepsNode] Analyzing dependencies in: ${repoPath}`);

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

      console.log(`[DepsNode] Found ${report.artifacts.length} dependencies.`);
      return { depsReport };
    } catch (error: unknown) {
      console.error(
        `[DepsNode] Syft analysis failed. ${(error as Error).message}`,
      );
      return { depsReport: { report: [] } };
    }
  }
}
