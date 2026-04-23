import { Injectable, Logger } from '@nestjs/common';
import { WorkflowState } from '../workflow-state.type';
import { GithubNodeHelper, LanguageBreakdown } from './github-node.helper';
import { Language } from './language.type';
import { INodeScanService } from '../inode-scan-service.interface';

export const GITHUB_NODE_SERVICE_TOKEN = 'GithubNodeService';

type GithubNodeResult = { languages: Language[] };

@Injectable()
export class GithubNodeService implements INodeScanService {
  private readonly logger = new Logger(GithubNodeService.name);

  constructor(private readonly linguist: GithubNodeHelper) {}

  async scan({ repoPath }: { repoPath: string }): Promise<GithubNodeResult> {
    this.logger.debug(`Ottenimento linguaggi`);
    let languages: Language[] = [];

    try {
      this.logger.debug(`RepoPath = ${repoPath}`);
      const normalized = await this.linguist.getLanguages(repoPath);
      languages = Object.entries(normalized).map((l) => ({
        name: l[0],
        value: l[1],
      }));

      return { languages };
    } catch (error) {
      this.logger.error('Failed to fetch languages.', error);
      return { languages };
    }
  }
}
