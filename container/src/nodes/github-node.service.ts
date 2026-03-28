import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';
import { WorkflowState } from '../types';

@Injectable()
export class GithubNodeService {
  private readonly octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  async getLanguages(state: WorkflowState): Promise<Partial<WorkflowState>> {
    const { owner, repository } = state.target;

    console.log(`[GithubNode] Fetching languages for ${owner}/${repository}`);

    try {
      const { data } = await this.octokit.rest.repos.listLanguages({
        owner,
        repo: repository,
      });

      const total = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);

      const languageBreakdown: Record<string, number> = {};
      for (const [lang, bytes] of Object.entries(data)) {
        languageBreakdown[lang] = Math.round((bytes / total) * 10000) / 100; // percentuale con 2 decimali
      }

      console.log(`[GithubNode] Languages found: ${Object.keys(languageBreakdown).join(', ')}`);
      return { languageBreakdown };
    } catch (error) {
      console.error('[GithubNode] Failed to fetch languages.', error);
      return { languageBreakdown: {} };
    }
  }

  async authTest(): Promise<string> {
    const { data: { login } } = await this.octokit.rest.users.getAuthenticated();
    return login;
  }
}
