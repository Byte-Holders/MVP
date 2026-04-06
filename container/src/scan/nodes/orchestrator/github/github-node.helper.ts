import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';

type LanguageBreakdown = Record<string, number>;

@Injectable()
export class GithubNodeHelper {
  private readonly octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  async getLanguages({
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

  normalizeData(languageData: LanguageBreakdown): LanguageBreakdown {
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
