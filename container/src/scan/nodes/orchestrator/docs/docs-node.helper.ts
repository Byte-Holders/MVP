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
      return match ? parseFloat(match[1]) : 0;
    } catch (err) {
      this.logger.error('Errore nel calcolo del voto:', err);
      return 0;
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
const BATCH_SIZE_BYTES = 512 * 1024;

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
  '.yaml',
  '.yml',
  '.toml',
  '.xml',
  '.env',
  '.md',
  '.sh',
  '.bash',
  '.dockerfile',
  '.sql',
  '.graphql',
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

const SYS_README = `Sei un technical writer esperto. Il tuo compito è analizzare il README di un repository e controllare che siano presenti le seguenti informazioni, ed eventualmente commentarne la completezza:
1. lo scopo del progetto in repository
2. come sono strutturate le cartelle
3. come effettuare la build del progetto, se un'applicazione, o predisporre la libreria all'importazione, se una libreria
4. un esempio di utilizzo del progetto in repository: se si tratta di una libreria, allora devono essere presenti dei pezzi di codice che ne descrivano l'implementazione;
se si tratta di un software, come lanciarlo, e quindi tutta la fase di preparazione oltre a quella di build.

Dovrai anche valutare il linguaggio utilizzato, per il quale devi tenere a mente quanto segue:
- Se la lingua utilizzata è l'italiano, l'indice di Gulpease deve essere maggiore di 40. L'indice di Gulpease è calcolato come segue: 89 + ((300 * <numero delle frasi>) - (10 * <numero delle lettere>)) / <numero delle parole>. Nel calcolare questi valori escludi i termini specialistici.
- Se la lingua utilizzata è l'inglese, la formula di Flesch deve restituire un risultato maggiore di 40. La formula di Flesch è la seguente: 206,385 - (84,6 * <numero medio di sillabe per parola>) - (1,015 * <numero medio di parole per frase). Nel calcolare questi valori escludi i termini specialistici.

La tua valutazione deve essere strutturata come segue:
1. **Panoramica (<voto>/5)**, in cui rispondi ai punti 1. e 2. dell'elenco precedente, ovvero allo dello scopo del progetto e la struttura delle cartelle
2. **Completezza (<voto>/3)**, in cui rispondi ai punti 3. e 4. dell'elenco precedente.
3. **Linguaggio (<voto>/2)**, in cui riporti una breve descrizione discorsiva sul linguaggio utilizzato, in base alla lingua, facendo riferimento all'indice di Gulpease o alla formula di Flesch.
Aggiungi il valore calcolato in fondo tra parentesi quadre. Ad esempio: "[Indice di Gulpease: 56]", senza virgolette.

I campi <voto> che trovi all'interno dell'ultimo elenco, per ciascun punto dell'elenco, sono valutati come segue:
1. Il punteggio massimo parziale che fa riferimento allo scopo del progetto in repository è 3. Il punteggio massimo parziale che fa riferimento alla struttura delle cartelle é 1.
Per ciascuno, lo scenario peggiore è se non è presente, in qual caso il punteggio parziale è 0. Se nella struttura delle cartelle occupa tra le 20 e le 30 righe, il punteggio è 0,5. Se ne occupa più di 30, il punteggio è 0.
2. Nel caso di un'applicazione, la modalità di build vale massimo 2 punti e quella di esempio di utilizzo massimo 1 punto. L'assenza di sezioni (o comunque del contenuto) apposito porta la relativa porzione di punteggio a 0 punti.
Nel caso di una libreria, la modalità di preparazione per l'importazione vale 1 punto, quella di utilizzo 2 punti. Qualora si possa evincere dal README che l'importazione è banale, anche se tale descrizione è assente viene comunque assegnato un punto. L'assenza di sezioni (o comunque del contenuto) apposito porta la relativa porzione di punteggio a 0 punti.
3. Un valore calcolato compreso inclusivamente tra 40 e 50 vale 1 punto. Un valore calcolato maggiore di 50 vale 2 punti.

Non inserire i punteggi parziali all'interno delle valutazioni. Limitati a inserire solamente i voti esplicitati all'interno di <voto>.
Assicurati che ciascun punto sia ben commentato ed argomentato. Evita di essere sintetico, a favore dell'essere esaustivo.
Non fare riferimento alle formule utilizzate, e nell'esaustività sii discorsivo pur mantenendo la struttura richiesta.
Non fare riferimento ai punteggi parziali che hai calcolato.
Non fare riferimento alla logica del software o alla modalità in cui ricevi gli input.
Non fare riferimento alla modalità in cui produci risultati.
Assicurati di produrre markdown valido.`;

const SYS_COMMENTS_BATCH = `Sei un esperto di qualità del codice. Il tuo compito è analizzare la qualità della documentazione all'interno dei file sorgente e fornire un voto compreso inclusivamente tra 0 e 10.
I parametri secondo cui effettui le analisi sono i seguenti:
1. Utilizzo di commenti su cui può essere fatto parsing dalle IDE e generatori di documentazione. Se presenti all'interno di tutte le funzioni pubbliche, allora assegni 2 punti.
Se assenti da tutte le funzioni pubbliche, assegna 0 punti a questa porzione di documentazione, e ignora i punti successivi.
Qualora ci siano dei commenti solamente in parte delle funzioni pubbliche, il voto lo ottieni in base al rapporto <funzioni pubbliche commentate> / <funzioni pubbliche totali>
2. Coerenza tra i commenti delle funzioni e l'effettivo funzionamento della funzione, per quanto comprensibile da un'analisi statica. Se non possiedi informazioni a sufficienza per trarre una conclusione,
assumi una posizione pessimistica, ma esplicitalo nel report. Il punteggio massimo che puoi assegnare relativamente a questo punto è 4 un punteggio di 4 punti. Il punteggio minimo,
che corrisponde al caso peggiore, ovvero un caso in cui i commenti siano totalmente incoerenti con le definizioni delle funzioni, oppure che non ci sia alcun commento da analizzare,
corrisponde a un punteggio di 0 punti.
3. Completezza della documentazione. Questo fa riferimento a pre-condizioni, post-condizioni, tipi di valore che ci si aspetta come parametro, specifica del tipo di ritorno e eccezioni che possono essere lanciate dalla keyword 'throw'
o da altre funzioni chiamate all'interno della funzione analizzata.
Se mancano i tipi di ritorno o i tipi dei parametri, assegna un punteggio di 0 punti.
Altrimenti, partendo da un punteggio massimo di 4 punti: se mancano pre-condizioni e post-condizioni, rimuovi 1 punto; se mancano i tipi di eccezioni che possono essere lanciate, rimuovi 2 punti.

Il report che produci ha la seguente forma:
1. Percorso relativo del file come intestazione di sezione
2. **Metodi pubblici (<voto ottenuto dal punto 1. dell'elenco precedente>/2):** breve descrizione sulla tipologia di metodi in cui manca documentazione, se presenti.
3. **Coerenza (<voto ottenuto dal punto 2. dell'elenco precedente>/4):** breve descrizione di quali sono i punti che portano a incoerenza tra analisi statica e commenti.
4. **Completezza (<voto ottenuto dal punto 3. dell'elenco precedente>/4):**
*Tipi attesi e di ritorno*: <presenti/assenti>
*Precondizioni e post-condizioni*: <commenti che le riportano>/<numero commenti>.
*Eccezioni*: <commenti in cui sono specificate quelle lanciate da un throw>/<funzioni che le dovrebbero specificare>.

Sii conciso e diretto nelle descrizioni.
Assicurati di produrre markdown valido.`;

const SYS_COMMENTS_SYNTHESIS = `Sei un tech lead esperto. Ricevi report parziali sulla qualità dei commenti di una codebase, suddivisi in batch.
I report parziali che ti vengono passati sono strutturati come segue:

1. Percorso relativo del file come intestazione di sezione
2. **Metodi pubblici (<voto ottenuto dal punto 1. dell'elenco precedente>/2):** breve descrizione sulla tipologia di metodi in cui manca documentazione, se presenti.
3. **Coerenza (<voto ottenuto dal punto 2. dell'elenco precedente>/4):** breve descrizione di quali sono i punti che portano a incoerenza tra analisi statica e commenti.
4. **Completezza (<voto ottenuto dal punto 3. dell'elenco precedente>/4):**
*Tipi attesi e di ritorno*: <presenti/assenti>
*Precondizioni e post-condizioni*: <commenti che le riportano>/<numero commenti>.
*Eccezioni*: <commenti in cui sono specificate quelle lanciate da un throw>/<funzioni che le dovrebbero specificare>.

Produci un unico report con la seguente struttura:
1. **Metodi pubblici (<media dei voti ottenuti dai punti 2. dei report forniti>/2):** breve riassunto dei punti 2. dei report forniti
2. **Coerenza (<media dei voti ottenuti dai punti 3. dei report forniti>/4):** breve riassunto dei punti 3. dei report forniti
3. **Completezza (<media dei voti ottenuti dai punti 4. dei report forniti>/4):** breve riassunto dei punti 4. dei report forniti
*Tipi attesi e di ritorno*: <presenti/assenti>
*Precondizioni e post-condizioni*: <commenti che le riportano>/<numero commenti>.
*Eccezioni*: <commenti in cui sono specificate>/<funzioni che le dovrebbero specificare>.
4. Porzioni del progetto più carenti in documentazione. Questo lo puoi ottenere guardando in generale i report parziali che ti vengono forniti, associando il punteggio del report parziale con il
percorso indicato dal punto 1. dello stesso

L'unica situazione in cui ti è permesso trasgredire la struttura sovrastante è quando il punteggio assegnato al punto 1. è 0/2. In tal caso, riporta semplicemente all'interno di una
<descrizione> che non è possibile effettuare un'analisi sui commenti perché non ci sono funzioni pubbliche sono commentate, e utilizza il seguente formato:
1. **Errore (0/10):** <descrizione>

Assicurati che ciascun punto sia ben commentato ed argomentato.
Evita di essere sintetico, a favore dell'essere esaustivo.
Non fare riferimento alle formule utilizzate, e nell'esaustività sii discorsivo pur mantenendo la struttura richiesta.
Non fare riferimento alla logica del software o alla modalità in cui ricevi gli input.
Non fare riferimento ai punteggi intermedi ottenuti dai vari batch.
Non fare riferimento alla modalità in cui produci risultati.
Assicurati di produrre markdown valido.`;

const SYS_MARK = `Sei un valutatore tecnico. Ricevi due report: uno sulla qualità di un file README e uno sulla qualità dei commenti nel codice.
Il primo report è composto dalle seguenti sezioni:
1. **Panoramica (<voto>/5)** <descrizione>
2. **Completezza (<voto>/3)** <descrizione>
3. **Linguaggio (<voto>/2)** <descrizione>


Il secondo report è composto dalle seguenti sezioni:
1. **Metodi pubblici (<voto>/2):** <descrizione>
2. **Coerenza (<voto>/4):** <descrizione>
3. **Completezza (<voto>/4):** <descrizione>
oppure
1. **Errore (0/10):** <descrizione>

Restituisci ESCLUSIVAMENTE il numero tra 0 a 10 che la media della somma dei <voti> indicati da ciascun report.

Ad esempio, se il primo report è
1. **Panoramica (1/5)** <descrizione>
2. **Completezza (2/3)** <descrizione>
3. **Linguaggio (2/2)** <descrizione>
e il secondo report è
1. **Metodi pubblici (2/2):** <descrizione>
2. **Coerenza (3/4):** <descrizione>
3. **Completezza (1/4):** <descrizione>
restituisce ESCLUSIVAMENTE il numero "5.5", senza virgolette. Il numero lo ottieni sommando i voti di ciascun report (1+2+2=5 e 2+3+1=6) e poi facendo la media dei due punteggi ((5+6)/2 = 5.5).

Analogamente, se il primo report è
1. **Panoramica (4/5)** <descrizione>
2. **Completezza (0/3)** <descrizione>
3. **Linguaggio (1/2)** <descrizione>
e il secondo report è
1. **Errore (0/10):** <descrizione>
allora restituisci ESCLUSIVAMENTE il numero "2.5", senza virgolette. Il numero lo ottieni sommando i voti di ciascun report (4+0+1=5 e 0=0) e poi facendo la media dei due punteggi ((5+0)/2 = 2.5).
Non aggiungere testo, spiegazioni, procedimenti o simboli. Solo il numero.`;
