import { Injectable, Logger } from '@nestjs/common';
import { DepsReport } from './deps-report.type';
import { WorkflowState } from '../workflow-state.type';
import { INodeScanService } from '../inode-scan-service.interface';
import {
  DependencyNodeHelper,
  DependencyVulnerability,
} from './dependency-node.helper';

export const DEPENDENCY_NODE_SERVICE_TOKEN = 'DependencyNodeService';

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

    const defaultReport: DepsReport = {
      list: [],
      libraries: [],
      frameworks: [],
      vulnerabilities: [],
      vulnerabilityAnalysis: '',
    };

    try {
      const sbomRaw = await this.helper.executeSyft(repoPath);
      const list = this.helper.parseSbom(sbomRaw);

      let rawVulnerabilities: DependencyVulnerability[] = [];
      try {
        const grypeRaw = await this.helper.executeGrype(sbomRaw);
        rawVulnerabilities = this.helper.parseGrype(grypeRaw);
      } catch (grypeError: unknown) {
        this.logger.error(
          `Analisi Grype fallita: ${(grypeError as Error).message}`,
        );
      }

      // Traduzione in italiano delle descrizioni
      const translatedVulnerabilities =
        await this.helper.translateDescriptions(rawVulnerabilities);

      const { libraries, frameworks, vulnerabilityAnalysis } =
        await this.helper.analyzeDependencies(
          repoPath,
          list,
          translatedVulnerabilities,
        );

      this.logger.log(
        `Analisi delle dipendenze terminata. Identificate ${libraries.length} librerie e ${frameworks.length} framework.`,
      );

      const depsReport: DepsReport = {
        list,
        libraries,
        frameworks,
        vulnerabilities: translatedVulnerabilities.map((v) => ({
          id: v.id,
          severity: v.severity,
          description: v.description,
          packageName: v.packageName,
          packageVersion: v.packageVersion,
          fixVersion: v.fixVersion,
        })),
        vulnerabilityAnalysis,
      };

      return { depsReport };
    } catch (error: unknown) {
      this.logger.error(
        `Analisi delle dipendenze fallita: ${(error as Error).message}`,
      );
      return { depsReport: defaultReport };
    }
  }
}
