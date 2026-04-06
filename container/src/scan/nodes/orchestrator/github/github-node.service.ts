import { Injectable } from '@nestjs/common';
import { Target } from '../../../target.types';
import { WorkflowState } from '../orchestrator.service';
import { GithubNodeHelper } from './github-node.helper';

@Injectable()
export class GithubNodeService {
  constructor(private readonly helper: GithubNodeHelper) {}

  async scan(target: Target): Promise<Partial<WorkflowState>> {
    const { owner, repository } = target;

    console.log(`[GithubNode] Fetching languages for ${owner}/${repository}`);

    try {
      const languageData = await this.helper.getLanguages({
        owner,
        repository,
      });

      const normalized = this.helper.normalizeData(languageData);

      console.log(
        `[GithubNode] Languages found: ${Object.entries(normalized).join(',\n')}`,
      );
      return { languageBreakdown: normalized };
    } catch (error) {
      console.error('[GithubNode] Failed to fetch languages.', error);
      return { languageBreakdown: {} };
    }
  }
}
