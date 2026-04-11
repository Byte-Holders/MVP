import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatBedrockConverse } from '@langchain/aws';
import { CodeQualityReport } from '../synthesizer/synthesizer.types';

@Injectable()
export class DocsNodeHelper {
  private readonly logger = new Logger(DocsNodeHelper.name);

  createModel() {
    return new ChatBedrockConverse({
      model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
      region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
      temperature: 0,
      maxTokens: 5000,
    });
  }

  // ─── Analisi completa della repo con batching ────────────────────────────────
  async analyzeRepoDocumentation(
    repoPath: string,
    allFiles: string[],
  ): Promise<{
    report: string;
    // inputTokens: number;
    // outputTokens: number;
    // totalTokens: number;
  }> {
    // const allFiles = this.collectTextFiles(repoPath);
    this.logger.log(`Avvio scansione di ${allFiles.length} file`);

    type Section = { header: string; content: string; sizeBytes: number };
    const sections: Section[] = [];

    // README sempre per primo
    const readmePath = path.join(repoPath, 'README.md');

    if (fs.existsSync(readmePath)) {
      const raw = fs.readFileSync(readmePath, 'utf-8');
      const content = `### README.md\n\`\`\`markdown\n${raw}\n\`\`\``;
      sections.push({
        header: 'README.md',
        content,
        sizeBytes: Buffer.byteLength(content, 'utf-8'),
      });
      this.logger.log(`README incluso`);
    } else {
      const content = `### README.md\n*(assente nella repository)*`;
      sections.push({
        header: 'README.md',
        content,
        sizeBytes: Buffer.byteLength(content, 'utf-8'),
      });
      this.logger.warn(`README non trovato`);
    }

    for (const filePath of allFiles) {
      const relativePath = path.relative(repoPath, filePath);
      if (relativePath === 'README.md') continue;
      const raw = fs.readFileSync(filePath, 'utf-8');
      const content = `### File: ${relativePath}\n\`\`\`\n${raw}\n\`\`\``;
      sections.push({
        header: relativePath,
        content,
        sizeBytes: Buffer.byteLength(content, 'utf-8'),
      });
    }

    // Suddivide le sezioni in batch da BATCH_SIZE_BYTES
    const batches: Section[][] = [];
    let currentBatch: Section[] = [];
    let currentSize = 0;

    for (const section of sections) {
      if (
        currentSize + section.sizeBytes > BATCH_SIZE_BYTES &&
        currentBatch.length > 0
      ) {
        batches.push(currentBatch);
        currentBatch = [];
        currentSize = 0;
      }
      currentBatch.push(section);
      currentSize += section.sizeBytes;
    }
    if (currentBatch.length > 0) batches.push(currentBatch);

    this.logger.debug(
      `Suddiviso in ${batches.length} batch (limite ${BATCH_SIZE_BYTES / 1024 / 1024} MB ciascuno)`,
    );
    batches.forEach((batch, i) => {
      const batchSizeKB = Math.round(
        batch.reduce((acc, s) => acc + s.sizeBytes, 0) / 1024,
      );
      this.logger.debug(
        `Batch ${i + 1}/${batches.length} — ${batch.length} file, ~${batchSizeKB} KB`,
      );
    });

    // Processa tutti i batch in parallelo
    const batchResults = await Promise.all(
      batches.map(async (batch, i) => {
        const payload = batch.map((s) => s.content).join('\n\n');
        try {
          const response = await this.createModel().invoke([
            new SystemMessage(SYS_BATCH),
            new HumanMessage(
              `Batch ${i + 1}/${batches.length} — file della repository:\n\n${payload}`,
            ),
          ]);

          // const usage = (response as any).usage_metadata ?? {};
          // const inputTok: number = usage.input_tokens ?? 0;
          // const outputTok: number = usage.output_tokens ?? 0;

          this.logger.debug(
            `✓ Batch ${i + 1}/${batches.length} completato — `,
            // `input: ${inputTok.toLocaleString('it-IT')} tok | output: ${outputTok.toLocaleString('it-IT')} tok`,
          );

          return {
            report: response.content as string /* , inputTok, outputTok */,
          };
        } catch (err) {
          this.logger.error(`Errore nel batch ${i + 1}:`, err);
          return {
            report: `*Errore durante l'analisi del batch ${i + 1}.*`,
            inputTok: 0,
            outputTok: 0,
          };
        }
      }),
    );

    // Aggrega token
    // let totalInputTokens = 0;
    // let totalOutputTokens = 0;
    const batchReports: string[] = [];

    for (const result of batchResults) {
      // totalInputTokens += result.inputTok;
      // totalOutputTokens += result.outputTok;
      batchReports.push(result.report);
    }

    // Sintesi finale (solo se ci sono più batch)
    let finalReport: string;

    if (batchReports.length === 1) {
      finalReport = batchReports[0];
    } else {
      this.logger.debug(
        `\nAvvio sintesi finale di ${batchReports.length} batch...`,
      );

      const synthesisPayload = batchReports
        .map((r, idx) => `=== Batch ${idx + 1} ===\n${r}`)
        .join('\n\n');

      try {
        const synthesisResponse = await this.createModel().invoke([
          new SystemMessage(SYS_SYNTHESIS),
          new HumanMessage(`Report parziali:\n\n${synthesisPayload}`),
        ]);

        // const usage = (synthesisResponse as any).usage_metadata ?? {};
        // const inputTok: number = usage.input_tokens ?? 0;
        // const outputTok: number = usage.output_tokens ?? 0;
        // totalInputTokens += inputTok;
        // totalOutputTokens += outputTok;

        this.logger.log(
          `Sintesi completata — `,
          // `input: ${inputTok.toLocaleString('it-IT')} tok | output: ${outputTok.toLocaleString('it-IT')} tok`,
        );

        finalReport = synthesisResponse.content as string;
      } catch (err) {
        this.logger.error('Errore nella sintesi finale:', err);
        finalReport = batchReports.join('\n\n---\n\n');
      }
    }

    // const totalTokens = totalInputTokens + totalOutputTokens;

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[ANALISI REPO] ✅ Analisi completata`);
    console.log(`  File analizzati : ${allFiles.length}`);
    console.log(`  Batch eseguiti  : ${batches.length}`);
    // console.log(
    //   `  Token input     : ${totalInputTokens.toLocaleString('it-IT')}`,
    // );
    // console.log(
    //   `  Token output    : ${totalOutputTokens.toLocaleString('it-IT')}`,
    // );
    // console.log(`  Token totali    : ${totalTokens.toLocaleString('it-IT')}`);
    console.log(`${'═'.repeat(60)}\n`);

    return {
      report: finalReport,
      // inputTokens: totalInputTokens,
      // outputTokens: totalOutputTokens,
      // totalTokens,
    };
  }

  // ─── Raccoglie ricorsivamente tutti i file di testo analizzabili ─────────────
  collectTextFiles(dirPath: string): string[] {
    const results: string[] = [];

    const walk = (current: string) => {
      let entries: fs.Dirent[];

      try {
        entries = fs.readdirSync(current, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) continue;

        const fullPath = path.join(current, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!TEXT_EXTENSIONS.has(ext)) continue;

          try {
            const stat = fs.statSync(fullPath);
            if (stat.size > MAX_FILE_SIZE_BYTES) {
              console.log(
                `  [SKIP] File troppo grande (${Math.round(stat.size / 1024)}KB): ${fullPath}`,
              );
              continue;
            }
            results.push(fullPath);
          } catch {
            // ignore
          }
        }
      }
    };

    walk(dirPath);
    return results;
  }

  async extractCodeQuality(report: string): Promise<CodeQualityReport> {
    try {
      const response = await this.createModel().invoke([
        new SystemMessage(SYS_CODE_QUALITY),
        new HumanMessage(`Report di analisi:\n${report}`),
      ]);

      const raw = (response.content as string)
        .replace(/```json|```/g, '')
        .trim();
      return JSON.parse(raw) as CodeQualityReport;
    } catch {
      return { analysis: [], mark: 0 };
    }
  }
}

// Estensioni considerate file di testo analizzabili
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
  '.py',
  '.java',
  '.kt',
  '.swift',
  '.go',
  '.rs',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.cs',
  '.php',
  '.rb',
  '.vue',
  '.svelte',
  '.html',
  '.css',
  '.scss',
  '.less',
  '.json',
  '.yaml',
  '.yml',
  '.toml',
  '.xml',
  '.env.example',
  '.md',
  '.txt',
  '.sh',
  '.bash',
  '.dockerfile',
  '.sql',
  '.graphql',
  '.proto',
]);

// Directory da ignorare durante la scansione
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  'coverage',
  '.next',
  '.nuxt',
  '.cache',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
  'env',
  'reports',
  'tmp',
  'temp',
  '.idea',
  '.vscode',
]);

// Dimensione massima per singolo file (100KB)
const MAX_FILE_SIZE_BYTES = 100 * 1024;

// Dimensione massima per batch inviato al modello (1MB)
const BATCH_SIZE_BYTES = 1024 * 1024;

const SYS_BATCH = `Sei un esperto di qualità del codice, documentazione e best practice.
Ricevi un sottoinsieme dei file di una repository. Per ogni file fornisci:
- Correttezza logica: bug, edge case non gestiti, logica errata
- Qualità del codice: leggibilità, naming, complessità
- Best practice: gestione errori, pattern architetturali, sicurezza di base
- Suggerimenti: massimo 3 miglioramenti prioritari per file
Se presente il README, valuta anche chiarezza, completezza e struttura della documentazione.
Sii conciso e diretto. Usa il percorso relativo del file come intestazione di sezione.`;

const SYS_SYNTHESIS = `Sei un tech lead esperto. Ricevi i report parziali di analisi di una repository, suddivisi in batch.
Produci un unico report finale strutturato:
1. **Analisi del README** (se presente in uno dei batch)
2. **Analisi per file** — consolida e deduplicati i risultati per-file dei batch
3. **Problemi ricorrenti** — pattern trasversali a più file
4. **Valutazione complessiva** — voto da 1 a 10 con motivazione
5. **Top 5 azioni di miglioramento** per l'intera codebase`;

const SYS_CODE_QUALITY = `Sei un tech lead esperto. Ricevi un report di analisi della qualità del codice.
Estrai i 5 principali suggerimenti sotto forma di linee guida da adottare, relativamente alle best practice non adottate all'interno del repository.
Restituisci SOLO un JSON con questa struttura, senza markdown:
{
  "analysis": [{"name": "<nome linea guida>", "recommendation": "<suggerimento specifico max 50 parole>"}],
  "mark": <voto intero da 1 a 10>
}`;
