import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryWriterService } from './repository-writer.service';
import { RepositoryFindRepositoryToken } from '../interfaces/repository.find-repository.interface';
import { RepositoryPersistRepositoryToken } from '../interfaces/repository.persist-repository.interface';
import { GitHubRepositoryToken } from '../interfaces/github.repository.interface';
import type { RepositoryEntity } from '../entities/repository.entity';

const makeEntity = (
  overrides: Partial<RepositoryEntity> = {},
): RepositoryEntity => ({
  repositoryId: 'myRepositoryId',
  ownerName: 'myOwner',
  name: 'myRepo',
  ...overrides,
});

describe('RepositoryWriterService', () => {
  let service: RepositoryWriterService;
  let mockFindRepository: {
    getRepository: jest.Mock;
    getRepositories: jest.Mock;
  };
  let mockPersistRepository: {
    addRepository: jest.Mock;
    updateToken: jest.Mock;
  };
  let mockGitHubRepository: {
    getBranches: jest.Mock;
    verifyAccess: jest.Mock;
  };

  beforeEach(async () => {
    mockFindRepository = {
      getRepository: jest.fn(),
      getRepositories: jest.fn(),
    };
    mockPersistRepository = {
      addRepository: jest.fn(),
      updateToken: jest.fn(),
    };
    mockGitHubRepository = {
      getBranches: jest.fn(),
      verifyAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryWriterService,
        {
          provide: RepositoryFindRepositoryToken,
          useValue: mockFindRepository,
        },
        {
          provide: RepositoryPersistRepositoryToken,
          useValue: mockPersistRepository,
        },
        { provide: GitHubRepositoryToken, useValue: mockGitHubRepository },
      ],
    }).compile();

    service = module.get<RepositoryWriterService>(RepositoryWriterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addRepository', () => {
    it('parses the URL and delegates to persist repository', async () => {
      mockPersistRepository.addRepository.mockResolvedValue('newRepoId');

      const result = await service.addRepository(
        'https://github.com/myOwner/myRepo',
      );

      expect(mockPersistRepository.addRepository).toHaveBeenCalledWith(
        'myOwner',
        'myRepo',
        undefined,
      );
      expect(result).toBe('newRepoId');
    });

    it('verifies access before persisting when a token is provided', async () => {
      mockGitHubRepository.verifyAccess.mockResolvedValue(undefined);
      mockPersistRepository.addRepository.mockResolvedValue('newRepoId');

      await service.addRepository(
        'https://github.com/myOwner/myRepo',
        'myToken',
      );

      expect(mockGitHubRepository.verifyAccess).toHaveBeenCalledWith(
        'myOwner',
        'myRepo',
        'myToken',
      );
      expect(mockPersistRepository.addRepository).toHaveBeenCalledWith(
        'myOwner',
        'myRepo',
        'myToken',
      );
    });

    it('skips verifyAccess when no token is provided', async () => {
      mockPersistRepository.addRepository.mockResolvedValue('newRepoId');

      await service.addRepository('https://github.com/myOwner/myRepo');

      expect(mockGitHubRepository.verifyAccess).not.toHaveBeenCalled();
    });

    it('rejects when verifyAccess rejects', async () => {
      mockGitHubRepository.verifyAccess.mockRejectedValue(
        new Error('unauthorized'),
      );

      await expect(
        service.addRepository(
          'https://github.com/myOwner/myRepo',
          'badToken',
        ),
      ).rejects.toThrow('unauthorized');

      expect(mockPersistRepository.addRepository).not.toHaveBeenCalled();
    });

    it('rejects when persist repository rejects', async () => {
      mockPersistRepository.addRepository.mockRejectedValue(
        new Error('db error'),
      );

      await expect(
        service.addRepository('https://github.com/myOwner/myRepo'),
      ).rejects.toThrow('db error');
    });
  });

  describe('updateToken', () => {
    it('fetches the entity, verifies access, then updates the token', async () => {
      mockFindRepository.getRepository.mockResolvedValue(makeEntity());
      mockGitHubRepository.verifyAccess.mockResolvedValue(undefined);
      mockPersistRepository.updateToken.mockResolvedValue(undefined);

      await service.updateToken('myRepositoryId', 'newToken');

      expect(mockFindRepository.getRepository).toHaveBeenCalledWith(
        'myRepositoryId',
      );
      expect(mockGitHubRepository.verifyAccess).toHaveBeenCalledWith(
        'myOwner',
        'myRepo',
        'newToken',
      );
      expect(mockPersistRepository.updateToken).toHaveBeenCalledWith(
        'myRepositoryId',
        'newToken',
      );
    });

    it('rejects when the repository is not found', async () => {
      mockFindRepository.getRepository.mockRejectedValue(
        new Error('not found'),
      );

      await expect(
        service.updateToken('unknownId', 'token'),
      ).rejects.toThrow('not found');

      expect(mockGitHubRepository.verifyAccess).not.toHaveBeenCalled();
    });

    it('rejects when verifyAccess rejects', async () => {
      mockFindRepository.getRepository.mockResolvedValue(makeEntity());
      mockGitHubRepository.verifyAccess.mockRejectedValue(
        new Error('unauthorized'),
      );

      await expect(
        service.updateToken('myRepositoryId', 'badToken'),
      ).rejects.toThrow('unauthorized');

      expect(mockPersistRepository.updateToken).not.toHaveBeenCalled();
    });
  });
});
