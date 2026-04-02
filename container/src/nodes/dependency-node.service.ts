import { Injectable } from '@nestjs/common';
import { DepsReport } from '../types';
import { WorkflowState } from '../orchestrator.service';
import { executeCli } from './exec.cli';

@Injectable()
export class DepsNodeService {
  //Runna syft
  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    console.log(`[DepsNode] Analyzing dependencies in: ${repoPath}`);

    try {
      const raw = (
        await executeCli(`syft`, `dir:${repoPath}`, `-o`, `json`, `-q`)
      )
        .toString()
        .trim();
      console.log(`Syft output: ${raw}`);
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
