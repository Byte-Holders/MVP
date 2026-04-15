import { Injectable, Logger } from '@nestjs/common';
import { WorkflowState } from '../workflow-state.type';
import { LinguistAdapter, LanguageBreakdown } from './linguist-adapter';
import { Language } from './language.type';
import { INodeScanService } from '../inode-scan-service.interface';

export const GITHUB_NODE_SERVICE_TOKEN = 'GithubNodeService';

@Injectable()
export class GithubNodeService implements INodeScanService {
  private readonly logger = new Logger(GithubNodeService.name);

  constructor(private readonly linguist: LinguistAdapter) {}

  async scan({
    repoPath,
  }: {
    repoPath: string;
  }): Promise<Partial<WorkflowState>> {
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
