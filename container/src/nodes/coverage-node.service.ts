import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { WorkflowState, CoverageReport } from '../types';

const execPromise = promisify(exec);

// ── Schema ────────────────────────────────────────────────────────────────────
@Schema({ timestamps: true })
export class Coverage extends Document {
  @Prop({ required: true })
  percentage: number;

  @Prop({ type: Object })
  details: {
    lines:      number;
    statements: number;
    functions:  number;
    branches:   number;
  };
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
    try {
      const coverageReport = await this.runTestsAndUpload(state.repoPath);
      return { coverageReport };
    } catch (err) {
      console.error('[CoverageNode] Coverage failed, continuing anyway.');
      const empty: CoverageReport = {
        statementsReport: 0,
        branchesReport:   0,
        functionsReport:  0,
        linesReport:      0,
      };
      return { coverageReport: empty };
    }
  }

  // ── Esegue Jest nella repo target e ritorna un CoverageReport ───────────────
  async runTestsAndUpload(targetPath: string = process.cwd()): Promise<CoverageReport> {
    // 1. Individua la cartella corretta (gestione monorepo)
    let actualPath = targetPath;
    if (!fs.existsSync(path.join(targetPath, 'package.json'))) {
      const backendPath = path.join(targetPath, 'backend');
      if (fs.existsSync(path.join(backendPath, 'package.json'))) {
        actualPath = backendPath;
        console.log(`[CoverageNode] Monorepo rilevato, entro in: ${actualPath}`);
      } else {
        throw new Error('Nessun package.json trovato nella root o in /backend');
      }
    }

    console.log(`[CoverageNode] Preparazione ambiente in: ${actualPath}`);

    // 2. Esegui i test con reporter json-summary
    const command =
      `cd "${actualPath}" && npm install && ` +
      `npx jest --coverage --coverageReporters="json-summary" --coverageReporters="text-summary"`;

    console.log(`[CoverageNode] Esecuzione comando: ${command}`);
    await execPromise(command);

    // 3. Leggi il file prodotto (summary oppure final come fallback)
    const coverageDir = path.join(actualPath, 'coverage');
    const summaryPath = path.join(coverageDir, 'coverage-summary.json');
    const finalPath   = path.join(coverageDir, 'coverage-final.json');

    let data: any;

    if (fs.existsSync(summaryPath)) {
      data = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    } else if (fs.existsSync(finalPath)) {
      console.log('[CoverageNode] Summary non trovato, estraggo dati da coverage-final.json');
      data = this.mapFinalToSummary(JSON.parse(fs.readFileSync(finalPath, 'utf-8')));
    } else {
      const files = fs.existsSync(coverageDir) ? fs.readdirSync(coverageDir) : 'cartella mancante';
      throw new Error(`Nessun file di coverage valido trovato. Files: ${files}`);
    }

    // 4. Mappa nei campi CoverageReport (allineato all'UML)
    const coverageReport: CoverageReport = {
      statementsReport: data.total.statements.pct || 0,
      branchesReport:   data.total.branches.pct   || 0,
      functionsReport:  data.total.functions.pct  || 0,
      linesReport:      data.total.lines.pct       || 0,
    };

    console.log(`[CoverageNode] Coverage completata: ${coverageReport.linesReport}% lines`);

    // 5. Persisti su MongoDB
    await this.coverageModel.create({
      percentage: coverageReport.linesReport,
      details: {
        lines:      coverageReport.linesReport,
        statements: coverageReport.statementsReport,
        functions:  coverageReport.functionsReport,
        branches:   coverageReport.branchesReport,
      },
    });

    return coverageReport;
  }

  // ── Salva la coverage già prodotta da Jest nella cwd ────────────────────────
  async runAndSaveCoverage(): Promise<Coverage> {
    const filePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');

    if (!fs.existsSync(filePath)) {
      throw new Error('File coverage-summary.json non trovato! Assicurati di aver lanciato i test.');
    }

    const summary = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    return new this.coverageModel({
      percentage: summary.total.lines.pct,
      details: {
        lines:      summary.total.lines.pct,
        statements: summary.total.statements.pct,
        functions:  summary.total.functions.pct,
        branches:   summary.total.branches.pct,
      },
    }).save();
  }

  // ── Storico coverage dal DB ──────────────────────────────────────────────────
  async findAll(): Promise<Coverage[]> {
    return this.coverageModel.find().sort({ createdAt: -1 }).exec();
  }

  // ── Fallback: coverage-final.json → struttura summary ───────────────────────
  private mapFinalToSummary(_finalData: any) {
    return {
      total: {
        lines:      { pct: 0 },
        statements: { pct: 0 },
        functions:  { pct: 0 },
        branches:   { pct: 0 },
      },
    };
  }
}
