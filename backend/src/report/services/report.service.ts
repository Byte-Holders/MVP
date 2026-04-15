import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IReportService } from '../interfaces/ireport.service.interface';
import type { IReportRepository } from '../interfaces/ireport.repository.interface';
import { ReportRepositoryToken } from '../interfaces/ireport.repository.interface';
import type { IRepositoryScoreWriter } from '../../repository/interfaces/repository.score-writer.interface';
import { RepositoryScoreWriterToken } from '../../repository/interfaces/repository.score-writer.interface';
import type { IWorkspaceUserService } from '../../workspace/workspaceUser/interfaces/IWorkspaceUserService';
import { IWorkspaceUserServiceToken } from '../../workspace/workspaceUser/interfaces/IWorkspaceUserService';
import { WorkspaceRole } from '../../workspace/roles.enum';
import type { ReportInfo, VulnCounts } from '../types/report.type';
import {
  ISCAN_STATUS_SERVICE_TOKEN,
  type IScanStatusService,
} from '../../scan/scan-status/interfaces/iscan-status.service';
import { ScanStatus } from '../../scan/scan-status/enums/scan-status.enum';

const DEVELOP_BRANCH = 'develop';

function countByLevel(levels: string[]): VulnCounts {
  const up = levels.map((l) => l.toUpperCase());
  return {
    critical: up.filter((l) => l === 'CRITICAL').length,
    high: up.filter((l) => l === 'HIGH').length,
    medium: up.filter((l) => l === 'MEDIUM').length,
    low: up.filter((l) => l === 'LOW').length,
  };
}

@Injectable()
export class ReportService implements IReportService {
  constructor(
    @Inject(ReportRepositoryToken)
    private readonly reportRepository: IReportRepository,
    @Inject(RepositoryScoreWriterToken)
    private readonly repositoryScoreWriter: IRepositoryScoreWriter,
    @Inject(IWorkspaceUserServiceToken)
    private readonly workspaceUserService: IWorkspaceUserService,
    @Inject(ISCAN_STATUS_SERVICE_TOKEN)
    private readonly scanStatusService: IScanStatusService,
  ) {}

  async saveReport(report: ReportInfo, callbackToken: string): Promise<void> {
    await this.scanStatusService.setScanStatusFromToken(
      callbackToken,
      ScanStatus.Completed,
    );
    await this.reportRepository.save(report);

    if (report.metadata?.target.branch === DEVELOP_BRANCH) {
      const { repositoryId } = report.metadata.target;
      await this.repositoryScoreWriter.updateScores(repositoryId, {
        documentationScore: report.data.docsReport?.mark,
        cvss: report.data.vulnerabilitiesReport?.mark,
        codeCoverage: report.data.testReport?.coverageReport?.lines,
        dateScan: new Date(report.metadata.endScanTime),
      });
    }
  }

  async getReport(
    repositoryId: string,
    branch: string,
    userId: string,
  ): Promise<ReportInfo> {
    const entity = await this.reportRepository.getReport(repositoryId, branch);
    if (!entity) {
      throw new NotFoundException(
        `Report non trovato per repository ${repositoryId}@${branch}`,
      );
    }

    const role = await this.workspaceUserService.getUserRoleForRepository(
      repositoryId,
      userId,
    );

    const depsVulnCounts = countByLevel(
      entity.data.depsReport.vulnerabilities.map((v) => v.severity),
    );
    const codeVulnCounts = countByLevel(
      entity.data.vulnerabilitiesReport.vulnerabilities.map((v) => v.impact),
    );

    const data: ReportInfo['data'] =
      role === WorkspaceRole.PROJECT_MANAGER
        ? {
            ...entity.data,
            depsReport: {
              ...entity.data.depsReport,
              list: undefined,
              vulnerabilities: [],
              vulnCounts: depsVulnCounts,
            },
            vulnerabilitiesReport: {
              ...entity.data.vulnerabilitiesReport,
              vulnerabilities: [],
              vulnCounts: codeVulnCounts,
            },
          }
        : {
            ...entity.data,
            depsReport: {
              ...entity.data.depsReport,
              vulnCounts: depsVulnCounts,
            },
            vulnerabilitiesReport: {
              ...entity.data.vulnerabilitiesReport,
              vulnCounts: codeVulnCounts,
            },
          };

    return {
      summary: entity.summary,
      data,
      metadata: entity.metadata,
    };
  }
}
