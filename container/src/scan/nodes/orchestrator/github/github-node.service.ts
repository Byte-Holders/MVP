import { Injectable, Logger } from '@nestjs/common';
import { Target } from '../../../target.types';
import { WorkflowState } from '../workflow-state.type';
import { GithubNodeHelper } from './github-node.helper';
import { Language } from './language.type';
import { INodeScanService } from '../inode-scan-service.interface';

export const GITHUB_NODE_SERVICE_TOKEN = 'GithubNodeService';

@Injectable()
export class GithubNodeService implements INodeScanService {
  private readonly logger = new Logger(GithubNodeService.name);

  constructor(private readonly helper: GithubNodeHelper) {}

  async scan({ target }: { target: Target }): Promise<Partial<WorkflowState>> {
    const { owner, repository } = target;

    this.logger.log(`Ottenimento linguaggi per ${owner}/${repository}`);
    let languages: Language[] = [];

    try {
      const languageData = await this.helper.getLanguages({
        owner,
        repository,
      });

      const normalized = this.helper.normalizeData(languageData);
      languages = Object.entries(normalized).map((l) => ({
        name: l[0],
        value: l[1],
      }));

      this.logger.log(`Linguaggi: ${Object.entries(normalized).join(', ')}`);

      return { languages };
    } catch (error) {
      this.logger.error('[GithubNode] Failed to fetch languages.', error);
      return { languages };
    }
  }
}
