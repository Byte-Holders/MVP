import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DepsReport } from './deps-report.type';
import { WorkflowState } from '../workflow-state.type';
import { executeCli, type CliCommand } from '../../../exec.cli';
import { INodeScanService } from '../inode-scan-service.interface';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { DependencyNodeHelper } from './dependency-node.helper';

export const DEPENDENCY_NODE_SERVICE_TOKEN = 'DependencyNodeService';

type DepsReportUnit = { name: string; version: string };

@Injectable()
export class DependencyNodeService implements INodeScanService {
  private readonly logger = new Logger(DependencyNodeService.name);

  constructor(private readonly helper: DependencyNodeHelper) {}

  async scan({
    repoPath,
  }: {
    repoPath: string;
  }): Promise<Partial<WorkflowState>> {
    this.logger.log(`Inizio analisi delle dipendenze in: ${repoPath}`);

    const report: DepsReport = {
      list: [],
      libraries: [],
      frameworks: [],
      vulnerabilities: [],
      vulnerabilityAnalysis: '',
    };

    let sbomRaw: string;
    try {
      const syftCommand: CliCommand = {
        name: 'syft',
        args: [`dir:${repoPath}`, `-o`, `json`, `-q`],
      };

      sbomRaw = (await executeCli(syftCommand)).toString().trim();

      const sbomReport = JSON.parse(sbomRaw) as {
        artifacts: { name: string; version: string }[];
      };

      this.logger.log(`Trovate ${sbomReport.artifacts.length} dipendenze.`);

      report.list = sbomReport.artifacts.map((dep) => ({
        name: dep.name,
        version: dep.version,
      }));

      let tempFile: string | undefined;
      try {
        tempFile = path.join(os.tmpdir(), `sbom-${Date.now()}.json`);
        fs.writeFileSync(tempFile, sbomRaw);

        const grypeCommand: CliCommand = {
          name: 'grype',
          args: [`sbom:${tempFile}`, `-o`, `json`],
        };

        const grypeRaw = (await executeCli(grypeCommand)).toString().trim();
        // TODO bisogna mettere una qualche spiegazione della vulnerabilità e aggiungere eventuali versioni per fix
        const grypeReport = JSON.parse(grypeRaw) as {
          matches: {
            vulnerability: { id: string; severity: string };
            artifact: { name: string; version: string };
          }[];
        };

        this.logger.log(
          `Grype: trovate ${grypeReport.matches.length} vulnerabilità totali.`,
        );

        report.vulnerabilities = grypeReport.matches.map((m) => ({
          id: m.vulnerability.id,
          severity: m.vulnerability.severity,
          packageName: m.artifact.name,
          packageVersion: m.artifact.version,
        }));
      } catch (grypeError: unknown) {
        this.logger.error(
          `Analisi Grype fallita: ${(grypeError as Error).message}`,
        );
      } finally {
        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }

      const model = this.helper.createModel();
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
          `Dipendenze:\n${JSON.stringify(report.list)}\n\nVulnerabilità:\n${JSON.stringify(report.vulnerabilities)}\npackage.json:${JSON.stringify(fs.readFileSync(path.join(repoPath, 'package.json')))}`,
        ),
      ]);

      const raw = (response.content as string)
        .replace(/```json|```/g, '')
        .trim();
      const parsed = JSON.parse(raw) as {
        libraries: DepsReportUnit[];
        frameworks: DepsReportUnit[];
        vulnerabilityAnalysis: string;
      };

      report.libraries = parsed.libraries ?? [];
      report.frameworks = parsed.frameworks ?? [];
      report.vulnerabilityAnalysis = parsed.vulnerabilityAnalysis ?? '';

      this.logger.log(
        `Identificate ${report.libraries.length} librerie e ${report.frameworks.length} framework`,
      );

      return { depsReport: report };
    } catch (error: unknown) {
      this.logger.error(
        `Analisi delle dipendenze fallita: ${(error as Error).message}`,
      );
      return { depsReport: report };
    }
  }
}
