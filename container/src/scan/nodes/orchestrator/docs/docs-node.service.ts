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

  async scan({
    repoPath,
  }: {
    repoPath: string;
  }): Promise<Partial<WorkflowState>> {
    this.logger.log('Inizio analisi della documentazione');

    const files = this.helper.collectTextFiles(repoPath);

    const docsReport: DocsReport = await this.helper.analyzeRepoDocumentation(
      repoPath,
      files,
    );

    return { docsReport };
  }
}
