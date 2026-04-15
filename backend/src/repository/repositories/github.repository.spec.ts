import { ForbiddenException, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { GitHubRepository } from './github.repository';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const makeResponse = (status: number, body: unknown = {}): Response =>
  ({
    status,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

describe('GitHubRepository', () => {
  let repo: GitHubRepository;

  beforeEach(() => {
    repo = new GitHubRepository();
    mockFetch.mockReset();
  });

  describe('getBranches', () => {
    it('returns branch names on success', async () => {
      mockFetch.mockResolvedValue(
        makeResponse(200, [{ name: 'main' }, { name: 'develop' }]),
      );

      const result = await repo.getBranches('owner', 'repo');

      expect(result).toEqual(['main', 'develop']);
    });

    it('includes Authorization header when accessToken is provided', async () => {
      mockFetch.mockResolvedValue(makeResponse(200, []));

      await repo.getBranches('owner', 'repo', 'myToken');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer myToken',
          }),
        }),
      );
    });

    it('omits Authorization header when no accessToken is given', async () => {
      mockFetch.mockResolvedValue(makeResponse(200, []));

      await repo.getBranches('owner', 'repo');

      const [, options] = mockFetch.mock.calls[0] as [string, { headers: Record<string, string> }];
      expect(options.headers['Authorization']).toBeUndefined();
    });

    it('throws NotFoundException on 404', async () => {
      mockFetch.mockResolvedValue(makeResponse(404));
      await expect(repo.getBranches('owner', 'repo')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException on 403', async () => {
      mockFetch.mockResolvedValue(makeResponse(403));
      await expect(repo.getBranches('owner', 'repo')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it.each([502, 503, 504])(
      'throws ServiceUnavailableException on %i',
      async (status) => {
        mockFetch.mockResolvedValue(makeResponse(status));
        await expect(repo.getBranches('owner', 'repo')).rejects.toThrow(
          ServiceUnavailableException,
        );
      },
    );

    it('throws generic Error on other non-ok status', async () => {
      mockFetch.mockResolvedValue(makeResponse(500));
      await expect(repo.getBranches('owner', 'repo')).rejects.toThrow(
        'GitHub API error: 500',
      );
    });
  });

  describe('verifyAccess', () => {
    it('resolves without throwing on 200', async () => {
      mockFetch.mockResolvedValue(makeResponse(200));
      await expect(
        repo.verifyAccess('owner', 'repo', 'myToken'),
      ).resolves.toBeUndefined();
    });

    it('throws UnauthorizedException on 401', async () => {
      mockFetch.mockResolvedValue(makeResponse(401));
      await expect(
        repo.verifyAccess('owner', 'repo', 'myToken'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on 403', async () => {
      mockFetch.mockResolvedValue(makeResponse(403));
      await expect(
        repo.verifyAccess('owner', 'repo', 'myToken'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it.each([502, 503, 504])(
      'throws ServiceUnavailableException on %i',
      async (status) => {
        mockFetch.mockResolvedValue(makeResponse(status));
        await expect(
          repo.verifyAccess('owner', 'repo', 'myToken'),
        ).rejects.toThrow(ServiceUnavailableException);
      },
    );

    it('throws generic Error on other non-ok status', async () => {
      mockFetch.mockResolvedValue(makeResponse(500));
      await expect(
        repo.verifyAccess('owner', 'repo', 'myToken'),
      ).rejects.toThrow('GitHub API error: 500');
    });
  });
});
