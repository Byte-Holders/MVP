import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatBedrockConverse } from '@langchain/aws';
import { DocsReport } from './docs-report.type';

type Section = { header: string; content: string; sizeBytes: number };

@Injectable()
export class DocsNodeHelper {
  private readonly logger = new Logger(DocsNodeHelper.name);

  createModel(): ChatBedrockConverse {
    return new ChatBedrockConverse({
      model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
      region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
      temperature: 0,
      maxTokens: 5000,
    });
  }

  buildSections(repoPath: string, allFiles: string[]): Section[] {
    return allFiles
      .map((filePath) => {
        const relativePath = path.relative(repoPath, filePath);
        if (relativePath === 'README.md') return null;

        const raw = fs.readFileSync(filePath, 'utf-8');
        const content = `### File: ${relativePath}\n\`\`\`\n${raw}\n\`\`\``;
        return {
          header: relativePath,
          content,
          sizeBytes: Buffer.byteLength(content, 'utf-8'),
        };
      })
      .filter((s): s is Section => s !== null);
  }

  createBatches(sections: Section[]): Section[][] {
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
    return batches;
  }

  async processBatch(
    batch: Section[],
    index: number,
    total: number,
    systemPrompt: string,
  ): Promise<string> {
    const payload = batch.map((s) => s.content).join('\n\n');
    try {
      const response = await this.createModel().invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(
          `Batch ${index + 1}/${total} — file della repository:\n\n${payload}`,
        ),
      ]);
      this.logger.debug(`✓ Batch ${index + 1}/${total} completato`);
      return response.content as string;
    } catch (err) {
      this.logger.error(`Errore nel batch ${index + 1}:`, err);
      return `*Errore durante l'analisi del batch ${index + 1}.*`;
    }
  }

  async synthesizeReports(
    reports: string[],
    systemPrompt: string,
  ): Promise<string> {
    if (reports.length === 1) return reports[0];

    this.logger.debug(`Avvio sintesi di ${reports.length} batch...`);
    const payload = reports
      .map((r, i) => `=== Batch ${i + 1} ===\n${r}`)
      .join('\n\n');

    try {
      const response = await this.createModel().invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Report parziali:\n\n${payload}`),
      ]);
      this.logger.log('Sintesi completata');
      return response.content as string;
    } catch (err) {
      this.logger.error('Errore nella sintesi:', err);
      return reports.join('\n\n---\n\n');
    }
  }

  async analyzeReadme(repoPath: string): Promise<string> {
    const readmePath = path.join(repoPath, 'README.md');

    if (!fs.existsSync(readmePath)) {
      this.logger.warn('README non trovato');
      return '*README assente nella repository. Si consiglia di crearne uno.*';
    }

    const raw = fs.readFileSync(readmePath, 'utf-8');
    this.logger.log('Analisi README avviata');

    try {
      const response = await this.createModel().invoke([
        new SystemMessage(SYS_README),
        new HumanMessage(`### README.md\n\`\`\`markdown\n${raw}\n\`\`\``),
      ]);
      return response.content as string;
    } catch (err) {
      this.logger.error("Errore nell'analisi del README:", err);
      return `*Errore durante l'analisi del README.*`;
    }
  }

  async analyzeCodeComments(
    repoPath: string,
    allFiles: string[],
  ): Promise<string> {
    const sections = this.buildSections(repoPath, allFiles);
    const batches = this.createBatches(sections);

    this.logger.debug(
      `Analisi commenti: ${batches.length} batch su ${sections.length} file`,
    );

    const batchReports = await Promise.all(
      batches.map((batch, i) =>
        this.processBatch(batch, i, batches.length, SYS_COMMENTS_BATCH),
      ),
    );

    return this.synthesizeReports(batchReports, SYS_COMMENTS_SYNTHESIS);
  }

  async extractMark(
    readmeReport: string,
    commentReport: string,
  ): Promise<number> {
    try {
      const response = await this.createModel().invoke([
        new SystemMessage(SYS_MARK),
        new HumanMessage(
          `README Report:\n${readmeReport}\n\nComment Report:\n${commentReport}`,
        ),
      ]);
      const text = (response.content as string).trim();
      const match = text.match(/\b(\d+(?:\.\d+)?)\b/);
      return match ? parseFloat(match[1]) : -1;
    } catch (err) {
      this.logger.error('Errore nel calcolo del voto:', err);
      return -1;
    }
  }

  async analyzeRepoDocumentation(
    repoPath: string,
    allFiles: string[],
  ): Promise<DocsReport> {
    this.logger.log(`Avvio scansione di ${allFiles.length} file`);

    const [readmeReport, commentReport] = await Promise.all([
      this.analyzeReadme(repoPath),
      this.analyzeCodeComments(repoPath, allFiles),
    ]);

    const mark = await this.extractMark(readmeReport, commentReport);

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[ANALISI REPO] ✅ Analisi completata`);
    console.log(`  File analizzati : ${allFiles.length}`);
    console.log(`  Voto finale     : ${mark}`);
    console.log(`${'═'.repeat(60)}\n`);

    return { readmeReport, commentReport, mark };
  }

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
              this.logger.warn(
                `[SKIP] File troppo grande (${Math.round(stat.size / 1024)}KB): ${fullPath}`,
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
}

//Costanti di dimensione batch e file

const MAX_FILE_SIZE_BYTES = 100 * 1024;
const BATCH_SIZE_BYTES = 1024 * 1024;

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

// Prompts

const SYS_README = `Sei un technical writer esperto. Analizza il README di una repository e produci un report strutturato con le seguenti sezioni:

1. **Panoramica** — Il README descrive chiaramente lo scopo del progetto?
2. **Completezza** — Sono presenti: installazione, utilizzo, configurazione, esempi, contribuzione, licenza?
3. **Chiarezza** — Il linguaggio è chiaro e accessibile? La struttura è logica e navigabile?
4. **Esempi di codice** — Sono presenti, aggiornati e funzionanti?
5. **Punti di miglioramento** — Elenca i 3 interventi prioritari con motivazione.

Sii diretto e costruttivo. Valuta come se dovessi onboardare un nuovo sviluppatore con solo questo README.`;

const SYS_COMMENTS_BATCH = `Sei un esperto di qualità del codice. Analizza la qualità della documentazione inline (commenti, JSDoc/TSDoc, docstring) nei file ricevuti.
Usa il percorso relativo del file come intestazione di sezione. Sii conciso e diretto.`;

const SYS_COMMENTS_SYNTHESIS = `Sei un tech lead esperto. Ricevi report parziali sulla qualità dei commenti di una codebase, suddivisi in batch.
Produci un unico report consolidato strutturato così:

1. **Pattern ricorrenti** — problemi o buone pratiche trasversali a più file
2. **Aree critiche** — file o moduli che richiedono intervento urgente
3. **Top 5 azioni di miglioramento** per elevare la qualità della documentazione inline`;

const SYS_MARK = `Sei un valutatore tecnico. Ricevi due report: uno sulla qualità del README e uno sulla qualità dei commenti nel codice.
Restituisci ESCLUSIVAMENTE un numero decimale da 1 a 10 che rappresenta il voto complessivo della documentazione del progetto.
Non aggiungere testo, spiegazioni o simboli. Solo il numero (es: 6.5).`;
