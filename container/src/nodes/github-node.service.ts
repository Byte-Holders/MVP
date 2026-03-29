import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';
import { WorkflowState } from '../types';

@Injectable()
export class GithubNodeService {
  private readonly octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  async scan(state: WorkflowState): Promise<Partial<WorkflowState>> {
    const { owner, repository } = state.target;

    console.log(`[GithubNode] Fetching languages for ${owner}/${repository}`);

    try {
      const languageData = await this.getLanguages({ owner, repository });

      const normalized: LanguageBreakdown = this.normalizeData(languageData);

      console.log(
        `[GithubNode] Languages found: ${Object.keys(normalized).join(', ')}`,
      );
      return { languageBreakdown: normalized };
    } catch (error) {
      console.error('[GithubNode] Failed to fetch languages.', error);
      return { languageBreakdown: {} };
    }
  }

  private async getLanguages({
    owner,
    repository,
  }: {
    owner: string;
    repository: string;
  }): Promise<LanguageBreakdown> {
    const { data } = await this.octokit.rest.repos.listLanguages({
      owner,
      repo: repository,
    });
    return data;
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

type LanguageBreakdown = Record<string, number>;
