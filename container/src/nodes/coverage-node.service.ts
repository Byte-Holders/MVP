import { Injectable } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { WorkflowState, CoverageReport } from '../types';

// ── Schema ────────────────────────────────────────────────────────────────────
@Schema({ timestamps: true })
export class Coverage {
  @Prop({ required: true, type: Number })
  lines: number;

  @Prop({ required: true, type: Number })
  statements: number;

  @Prop({ required: true, type: Number })
  functions: number;

  @Prop({ required: true, type: Number })
  branches: number;
}

export type CoverageDocument = Coverage & Document;
export const CoverageSchema = SchemaFactory.createForClass(Coverage);

// ── Node ──────────────────────────────────────────────────────────────────────
@Injectable()
export class CoverageNodeService {
  constructor() {}

  // ── LangGraph node entry point ──────────────────────────────────────────────
  async scan(state: WorkflowState): Promise<Partial<WorkflowState>> {
    console.log(`[CoverageNode] Starting test coverage in: ${state.repoPath}`);

    let report: CoverageReport = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    };

    try {
      report = await this.runTestsAndUpload(state.repoPath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`[CoverageNode] Coverage failed: ${err.message}`);
      } else {
        console.error('[CoverageNode] Coverage failed, continuing anyway.');
      }
    }
    return { coverageReport: report };
  }

  // ── Esegue Jest nella repo target e ritorna un CoverageReport ───────────────
  async runTestsAndUpload(
    targetPath: string = process.cwd(),
  ): Promise<CoverageReport> {
    this.checkValidFolder(targetPath);

    console.log(`[CoverageNode] Preparazione ambiente in: ${targetPath}`);

    // 2. Esegui i test con reporter json-summary
    let coverageReport: CoverageReport;

    try {
      coverageReport = this.runCoverageTool(targetPath);
      await this.persistReport(coverageReport);
      console.log(`[CoverageNode] Coverage completata con successo.`);
    } catch (err: unknown) {
      console.error(
        `[CoverageNode] Errore durante generazione report code coverage: ${(err as Error).message}`,
      );
      throw err;
    }

    return coverageReport;
  }

  private runCoverageTool(targetPath: string): CoverageReport {
    let report: CoverageReport;

    try {
      const stdout = this.executionWrapper(targetPath);
      report = this.parseOutput(stdout);
    } catch (err: unknown) {
      throw new Error(
        `Errore durante esecuzione coverage: ${(err as Error).message})`,
      );
    }

    return report;
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

  private checkValidFolder(checkPath: string) {
    if (!fs.existsSync(path.join(checkPath, 'package.json')))
      throw new Error('Nessun package.json in root');
  }

  private async persistReport(reportData: CoverageReport): Promise<void> {
    // await this.coverageModel.create(reportData);
  }

  private executionWrapper(targetPath: string): string {
    const command = `cd "${targetPath}" && npm install --silent && npx jest --coverage --coverageReporters="text-summary" 2>&1 | grep -E "Statements|Branches|Functions|Lines"`;

    console.log(`[CoverageNode] Esecuzione comando: ${command}`);
    return execSync(command).toString();
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
