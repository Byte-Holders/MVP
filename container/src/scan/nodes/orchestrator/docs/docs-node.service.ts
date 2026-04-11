import { Injectable, Logger } from '@nestjs/common';
import { DocsReport } from './docs-report.type';
import { WorkflowState } from '../workflow-state.type';
import { DocsNodeHelper } from './docs-node.helper';
import { INodeScanService } from '../inode-scan-service.interface';

export const DOCS_NODE_SERVICE_TOKEN = 'DocsNodeService';

@Injectable()
export class DocsNodeService implements INodeScanService {
  private readonly logger = new Logger(DocsNodeService.name);

  constructor(private readonly helper: DocsNodeHelper) {}

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    this.logger.log('Inizio analisi della documentazione');

    const files = this.helper.collectTextFiles(repoPath);

    const { report } = await this.helper.analyzeRepoDocumentation(
      repoPath,
      files,
    );

    const codeQualityReport = await this.helper.extractCodeQuality(report);

    const docsReport: DocsReport = {
      readmeReport: report,
      commentReport: '', // TODO riempire
      mark: codeQualityReport.mark,
    };

    return { docsReport, codeQualityReport };
  }
}
