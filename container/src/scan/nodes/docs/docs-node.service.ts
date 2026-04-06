import { Injectable } from '@nestjs/common';
import { DocsReport } from './docs-report.type';
import { WorkflowState } from '../orchestrator/orchestrator.service';
import { DocsNodeHelper } from './docs-node.helper';

@Injectable()
export class DocsNodeService {
  constructor(private readonly helper: DocsNodeHelper) {}

  async scan(repoPath: string): Promise<Partial<WorkflowState>> {
    const { report /*, totalTokens */ } =
      await this.helper.analyzeRepoDocumentation(repoPath);

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
