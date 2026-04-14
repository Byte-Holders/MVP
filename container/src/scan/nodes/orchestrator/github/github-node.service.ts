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
      // const languageData = await this.github.getLanguages(repoPath);

      // const normalized = this.normalizeData(languageData);
      // languages = Object.entries(normalized).map((l) => ({
      //   name: l[0],
      //   value: l[1],
      // }));
      this.logger.debug(`RepoPath = ${repoPath}`);
      const normalized = await this.linguist.getLanguages(repoPath);
      this.logger.debug(
        `Normalized = ${JSON.stringify(Object.entries(normalized))}`,
      );
      languages = Object.entries(normalized).map((l) => ({
        name: l[0],
        value: l[1],
      }));
      this.logger.debug(languages);

      this.logger.log(`Linguaggi: ${Object.entries(normalized).join(', ')}`);

      return { languages };
    } catch (error) {
      this.logger.error('Failed to fetch languages.', error);
      return { languages };
    }
  }

  private normalizeData(languageData: LanguageBreakdown): LanguageBreakdown {
    const normalized: LanguageBreakdown = {};

    const totalBytes = Object.values(languageData).reduce(
      (sum, bytes) => sum + bytes,
      0,
    );

    for (const [lang, bytes] of Object.entries(languageData)) {
      normalized[lang] = Math.round((bytes / totalBytes) * 10000) / 100; // percentuale con 2 decimali
    }

    return normalized;
  }
}
