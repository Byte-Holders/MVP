import { Injectable, Logger } from '@nestjs/common';
import { Target } from '../../../target.types';
import { WorkflowState } from '../workflow-state.type';
import { GithubNodeHelper } from './github-node.helper';

export const GITHUB_NODE_SERVICE_TOKEN = 'GithubNodeService';

@Injectable()
export class GithubNodeService {
  private readonly logger = new Logger(GithubNodeService.name);

  constructor(private readonly helper: GithubNodeHelper) {}

  async scan({ target }: { target: Target }): Promise<Partial<WorkflowState>> {
    const { owner, repository } = target;

    this.logger.log(`Ottenimento linguaggi per ${owner}/${repository}`);

    try {
      const languageData = await this.helper.getLanguages({
        owner,
        repository,
      });

      const normalized = this.helper.normalizeData(languageData);

      this.logger.log(`Linguaggi: ${Object.entries(normalized).join(', ')}`);

      return { languageBreakdown: normalized };
    } catch (error) {
      this.logger.error('[GithubNode] Failed to fetch languages.', error);
      return { languageBreakdown: {} };
    }
  }
}
