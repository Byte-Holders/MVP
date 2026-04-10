import { Injectable, Logger } from '@nestjs/common';
import { DocsReport } from './docs-report.type';
import { WorkflowState } from '../workflow-state.type';
import { DocsNodeHelper } from './docs-node.helper';

@Injectable()
export class DocsNodeService {
  private readonly logger = new Logger(DocsNodeService.name);

  constructor(private readonly helper: DocsNodeHelper) {}

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    this.logger.log('Inizio analisi della documentazione');

    const files = this.helper.collectTextFiles(repoPath);

    const { report /*, totalTokens */ } =
      await this.helper.analyzeRepoDocumentation(repoPath, files);

    // console.log(
    //   `[DocsNode] Token totali usati: ${totalTokens.toLocaleString('it-IT')}`,
    // );

    const docsReport: DocsReport = {
      readmeReport: { analysis: { analysis: report } },
      commentReport: [],
      mark: 5,
    };

    return { docsReport };
  }
}
