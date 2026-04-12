import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IReportService } from '../interfaces/ireport.service.interface';
import type { IReportRepository } from '../interfaces/ireport.repository.interface';
import { ReportRepositoryToken } from '../interfaces/ireport.repository.interface';
import type { IRepositoryScoreWriter } from '../../repository/interfaces/repository.score-writer.interface';
import { RepositoryScoreWriterToken } from '../../repository/interfaces/repository.score-writer.interface';
import type { ReportInfo } from '../types/report.type';

const DEVELOP_BRANCH = 'develop';

@Injectable()
export class ReportService implements IReportService {
  constructor(
    @Inject(ReportRepositoryToken)
    private readonly reportRepository: IReportRepository,
    @Inject(RepositoryScoreWriterToken)
    private readonly repositoryScoreWriter: IRepositoryScoreWriter,
  ) {}

  async saveReport(report: ReportInfo): Promise<void> {
    await this.reportRepository.save(report);

    if (report.metadata?.target.branch === DEVELOP_BRANCH) {
      const { owner, repository } = report.metadata.target;
      await this.repositoryScoreWriter.updateScores(owner, repository, {
        documentationScore: report.data.docsReport?.mark,
        cvss: report.data.vulnerabilitiesReport?.mark,
        codeCoverage: report.data.testReport?.coverageReport?.lines,
        dateScan: new Date(report.metadata.endScanTime),
      });
    }
  }

  async getReport(
    owner: string,
    repository: string,
    branch: string,
  ): Promise<ReportInfo> {
    const entity = await this.reportRepository.findLatestByTarget(
      owner,
      repository,
      branch,
    );
    if (!entity) {
      throw new NotFoundException(
        `Report non trovato per ${owner}/${repository}@${branch}`,
      );
    }
    return {
      summary: entity.summary,
      data: entity.data,
      metadata: entity.metadata,
    };
  }
}
