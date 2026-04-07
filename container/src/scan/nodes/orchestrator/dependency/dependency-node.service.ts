import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DepsReport } from './deps-report.type';
import { WorkflowState } from '../orchestrator.service';
import { executeCli, type CliCommand } from '../../../exec.cli';

@Injectable()
export class DepsNodeService {
  private readonly logger = new Logger(DepsNodeService.name);

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    this.logger.log(`Inizio analisi delle dipendenze in: ${repoPath}`);

    // Syft genera lo SBOM
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

      const depsReport: DepsReport = {
        report: sbomReport.artifacts.map((dep) => ({
          name: dep.name,
          version: dep.version,
        })),
      };

      //Grype fa analisi vulnerabilità sullo SBOM, passato come file temporaneo
      let tempFile: string | undefined;
      try {
        tempFile = path.join(os.tmpdir(), `sbom-${Date.now()}.json`);
        fs.writeFileSync(tempFile, sbomRaw);

        const grypeCommand: CliCommand = {
          name: 'grype',
          args: [`sbom:${tempFile}`, `-o`, `json`],
        };

        const grypeRaw = (await executeCli(grypeCommand)).toString().trim();
        const grypeReport = JSON.parse(grypeRaw) as {
          matches: {
            vulnerability: { id: string; severity: string; fix?: { versions: string[] } };
            artifact: { name: string; version: string };
          }[];
        };

        this.logger.log(
            `Grype: trovate ${grypeReport.matches.length} vulnerabilità totali.`,
        );

        depsReport.vulnerabilities = grypeReport.matches.map((m) => ({
          id: m.vulnerability.id,
          severity: m.vulnerability.severity,
          packageName: m.artifact.name,
          packageVersion: m.artifact.version,
          fixedInVersion: m.vulnerability.fix?.versions?.[0],
        }));
      } catch (grypeError: unknown) {
        this.logger.error(
            `Analisi Grype fallita: ${(grypeError as Error).message}`,
        );
        // Se grype fallisce restituisco comunque il report di syft
      } finally {
        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }

      return { depsReport };
    } catch (error: unknown) {
      this.logger.error(
          `Analisi delle dipendenze fallita: ${(error as Error).message}`,
      );
      return { depsReport: { report: [] } };
    }
  }
}

