/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { GithubNodeService } from './github-node.service';
import { LinguistAdapter, LanguageBreakdown } from './linguist-adapter';

const mockLanguageBreakdown = (): LanguageBreakdown => ({
  TypeScript: 70,
  Python: 20,
  Java: 10,
});

const DEFAULT_TARGET = { repoPath: 'myRepoPath' };

describe('GithubNodeService', () => {
  let githubNodeService: GithubNodeService;
  let linguist: jest.Mocked<LinguistAdapter>;

  beforeEach(async () => {
    linguist = { getLanguages: jest.fn() };

    const app = await Test.createTestingModule({
      providers: [
        GithubNodeService,
        { provide: LinguistAdapter, useValue: linguist },
      ],
    }).compile();

    githubNodeService = app.get<GithubNodeService>(GithubNodeService);
  });

  it('is defined', () => {
    expect(githubNodeService).toBeDefined();
  });

  it('returns mapped languages when getLanguages resolves with valid data', async () => {
    linguist.getLanguages.mockResolvedValue(mockLanguageBreakdown());

    const result = await githubNodeService.scan(DEFAULT_TARGET);

    expect(result).toEqual({
      languages: [
        { name: 'TypeScript', value: mockLanguageBreakdown()['TypeScript'] },
        { name: 'Python', value: mockLanguageBreakdown()['Python'] },
        { name: 'Java', value: mockLanguageBreakdown()['Java'] },
      ],
    });
  });

  it('returns empty languages when getLanguages throws', async () => {
    linguist.getLanguages.mockRejectedValue(new Error());

    const result = await githubNodeService.scan(DEFAULT_TARGET);

    expect(result).toEqual({ languages: [] });
  });
});
