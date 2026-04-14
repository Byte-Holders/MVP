import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { IGitHubRepository } from '../interfaces/github.repository.interface';

@Injectable()
export class GitHubRepository implements IGitHubRepository {
  async getBranches(
    ownerName: string,
    name: string,
    accessToken?: string,
  ): Promise<string[]> {
    const url = `https://api.github.com/repos/${ownerName}/${name}/branches`;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const response = await fetch(url, { headers });
    if (response.status === 404) {
      throw new NotFoundException(
        `Repository ${ownerName}/${name} non trovata su GitHub`,
      );
    }
    if (response.status === 403) {
      throw new ForbiddenException(
        'Rate limit GitHub superato o accesso negato',
      );
    }
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new ServiceUnavailableException('GitHub API temporaneamente non disponibile');
    }
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    const data = (await response.json()) as { name: string }[];
    return data.map((b) => b.name);
  }

  async verifyAccess(
    ownerName: string,
    name: string,
    accessToken: string,
  ): Promise<void> {
    const url = `https://api.github.com/repos/${ownerName}/${name}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedException(
        'Token GitHub non valido o non autorizzato per questo repository',
      );
    }
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new ServiceUnavailableException('GitHub API temporaneamente non disponibile');
    }
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
  }
}
