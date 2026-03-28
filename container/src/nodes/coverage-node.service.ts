import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { WorkflowState, CoverageReport } from '../types';

// ── Schema ────────────────────────────────────────────────────────────────────
@Schema({ timestamps: true })
export class Coverage extends Document {
  @Prop({ required: true, type: Number })
  lines: number;

  @Prop({ required: true, type: Number })
  statements: number;

  @Prop({ required: true, type: Number })
  functions: number;

  @Prop({ required: true, type: Number })
  branches: number;
}

export const CoverageSchema = SchemaFactory.createForClass(Coverage);

// ── Node ──────────────────────────────────────────────────────────────────────
@Injectable()
export class CoverageNodeService {
  constructor(
    @InjectModel(Coverage.name) private readonly coverageModel: Model<Coverage>,
  ) {}

  // ── LangGraph node entry point ──────────────────────────────────────────────
  async Scan(state: WorkflowState): Promise<Partial<WorkflowState>> {
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

  // ── Storico coverage dal DB ──────────────────────────────────────────────────
  async findAll(): Promise<Coverage[]> {
    return this.coverageModel.find().sort({ createdAt: -1 }).exec();
  }

  private runCoverageTool(targetPath: string): CoverageReport {
    try {
      const stdout = this.executionWrapper(targetPath);
      return this.parseOutput(stdout);
    } catch (err: unknown) {
      throw new Error(
        `Errore durante esecuzione coverage: ${(err as Error).message})`,
      );
    }
  }

  private parseOutput(output: string): CoverageReport {
    const split: string[] = this.splitResult(output);

    const report: CoverageReport = {
      statements: parseFloat(split[0].replace('%', '')),
      branches: parseFloat(split[1].replace('%', '')),
      functions: parseFloat(split[2].replace('%', '')),
      lines: parseFloat(split[3].replace('%', '')),
    };

    return report;
  }

  private checkValidFolder(checkPath: string) {
    if (!fs.existsSync(path.join(checkPath, 'package.json')))
      throw new Error('Nessun package.json in root');
  }

  private async persistReport(reportData: CoverageReport): Promise<void> {
    await this.coverageModel.create(reportData);
  }

  private executionWrapper(targetPath: string): string {
    const command =
      `cd "${targetPath}" && npm install && ` +
      ` npx jest --coverage --coverageReporters="text-summary" 2>&1 | grep : | head -n 4`;

    console.log(`[CoverageNode] Esecuzione comando: ${command}`);
    return execSync(command).toString();
  }

  private splitResult(result: string) {
    const split = result
      .replaceAll(/\s*(\s*\d+\/\d+\s*)*/, '')
      .replaceAll(/(Statements|Branches|Functions|Lines)\s+:\s*/, '')
      .split('\n')
      .filter((line) => line.trim().length != 0);

    if (split.length != 4) {
      throw new Error('Errore lettura parametro');
    }

    return split;
  }
}
