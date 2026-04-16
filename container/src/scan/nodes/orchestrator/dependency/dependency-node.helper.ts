import { Injectable, Logger } from '@nestjs/common';
import { ChatBedrockConverse } from '@langchain/aws';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { executeCli, type CliCommand } from '../../../exec.cli';

export type DepsReportUnit = { name: string; version: string };
export type DependencyVulnerability = {
  id: string;
  severity: string;
  description: string;
  packageName: string;
  packageVersion: string;
  fixVersion?: string;
};
export type DependencyAnalysis = {
  libraries: DepsReportUnit[];
  frameworks: DepsReportUnit[];
  vulnerabilityAnalysis: string;
};

@Injectable()
export class DependencyNodeHelper {
  private readonly logger = new Logger(DependencyNodeHelper.name);

  createModel() {
    return new ChatBedrockConverse({
      model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
      region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
      temperature: 0,
      maxTokens: 5000,
    });
  }

  // Syft

  async executeSyft(repoPath: string): Promise<string> {
    const command: CliCommand = {
      name: 'syft',
      args: [`dir:${repoPath}`, `-o`, `json`, `-q`],
    };
    return (await executeCli(command)).toString().trim();
  }

  parseSbom(sbomRaw: string): DepsReportUnit[] {
    const sbomReport = JSON.parse(sbomRaw) as {
      artifacts: { name: string; version: string }[];
    };
    this.logger.log(`Trovate ${sbomReport.artifacts?.length ?? 0} dipendenze.`);
    return (sbomReport.artifacts ?? []).map((dep) => ({
      name: dep.name,
      version: dep.version,
    }));
  }

  // Grype

  async executeGrype(sbomRaw: string): Promise<string> {
    let tempFile: string | undefined;
    try {
      tempFile = path.join(os.tmpdir(), `sbom-${Date.now()}.json`);
      fs.writeFileSync(tempFile, sbomRaw);

      const command: CliCommand = {
        name: 'grype',
        args: [`sbom:${tempFile}`, `-o`, `json`],
      };

      return (await executeCli(command)).toString().trim();
    } finally {
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  parseGrype(grypeRaw: string): DependencyVulnerability[] {
    const grypeReport = JSON.parse(grypeRaw) as {
      matches: {
        vulnerability: {
          id: string;
          severity: string;
          description: string;
          fix: { versions: string[]; state: string };
        };
        artifact: { name: string; version: string };
      }[];
    };

    this.logger.log(
        `Grype: trovate ${grypeReport.matches?.length ?? 0} vulnerabilità totali.`,
    );

    return (grypeReport.matches ?? []).map((m) => ({
      id: m.vulnerability.id,
      severity: m.vulnerability.severity,
      description: m.vulnerability.description,
      packageName: m.artifact.name,
      packageVersion: m.artifact.version,
      fixVersion:
          m.vulnerability.fix.state === 'fixed'
              ? m.vulnerability.fix.versions[0]
              : undefined,
    }));
  }

  async translateDescriptions(
      vulnerabilities: DependencyVulnerability[],
  ): Promise<DependencyVulnerability[]> {
    if (vulnerabilities.length === 0) return vulnerabilities;

    this.logger.log(
        `Traduzione di ${vulnerabilities.length} descrizioni di dipendenze in corso...`,
    );

    const descriptionsMap = vulnerabilities.reduce(
        (acc, vuln, index) => {
          if (vuln.description) acc[index] = vuln.description;
          return acc;
        },
        {} as Record<number, string>,
    );

    if (Object.keys(descriptionsMap).length === 0) return vulnerabilities;

    const model = this.createModel();

    try {
      const response = await model.invoke([
        new SystemMessage(
            `Sei un esperto di sicurezza software. Traduci in lingua italiana le descrizioni delle vulnerabilità delle dipendenze fornite nel seguente JSON. 
           Mantieni le chiavi numeriche originali. Rispondi SOLO ed esclusivamente con il JSON del dizionario tradotto, senza alcun markdown o testo introduttivo.`,
        ),
        new HumanMessage(JSON.stringify(descriptionsMap)),
      ]);

      const content = (response.content as string)
          .replace(/```json|```/g, '')
          .trim();

      const translatedMap = JSON.parse(content) as Record<string, string>;

      return vulnerabilities.map((vuln, index) => ({
        ...vuln,
        description: translatedMap[index.toString()] ?? vuln.description,
      }));
    } catch (error) {
      this.logger.error(
          'Errore durante la traduzione LLM, mantengo i testi originali.',
          error,
      );
      return vulnerabilities;
    }
  }

  async analyzeDependencies(
      repoPath: string,
      list: DepsReportUnit[],
      vulnerabilities: DependencyVulnerability[],
  ): Promise<DependencyAnalysis> {
    let packageJsonContent = '{}';
    try {
      const pkgPath = path.join(repoPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        packageJsonContent = fs.readFileSync(pkgPath, 'utf-8');
      }
    } catch (e) {
      this.logger.warn('Impossibile leggere package.json', e);
    }

    const model = this.createModel();

    try {
      const response = await model.invoke([
        new SystemMessage(
            `Sei un esperto di architettura e sicurezza software in typescript. Ricevi una lista di dipendenze software e un elenco di vulnerabilità.
        Ti viene anche fornito un file package.json che contiene le librerie esplicitamente utilizzate in un progetto.
        Restituisci SOLO un JSON con questa struttura, senza markdown:
        {
          "libraries": [{"name": "...", "version": "..."}],
          "frameworks": [{"name": "...", "version": "..."}],
          "vulnerabilityAnalysis": "..."
        }
        Separa le dipendenze in:
        - "frameworks": la lista di framework utilizzati all'interno del progetto. Compaiono sicuramente, e solamente, all'interno del file package.json
        - "libraries": tutte le librerie presenti nel package.json ma non all'interno del campo "frameworks" definito al punto precedente. Di ciascuna libreria deve essere anche presente la versione effettiva installata, che puoi trovare all'interno del report sulle dipendenze
        - "vulnerabilityAnalysis": una breve analisi riassuntiva delle vulnerabilità presenti all'interno della lista delle vulnerabilità. La lunghezza del riassunto è vincolata a massimo 100 parole.

        Assicurati che il documento JSON che produci sia valido.`,
        ),
        new HumanMessage(
            `Dipendenze:\n${JSON.stringify(list)}\n\nVulnerabilità:\n${JSON.stringify(vulnerabilities)}\npackage.json:${packageJsonContent}`,
        ),
      ]);

      const raw = (response.content as string)
          .replace(/```json|```/g, '')
          .trim();
      const parsed = JSON.parse(raw);

      return {
        libraries: parsed.libraries ?? [],
        frameworks: parsed.frameworks ?? [],
        vulnerabilityAnalysis: parsed.vulnerabilityAnalysis ?? '',
      };
    } catch (error) {
      this.logger.error(
          "Errore durante l'analisi LLM delle dipendenze",
          error,
      );
      return { libraries: [], frameworks: [], vulnerabilityAnalysis: '' };
    }
  }
}