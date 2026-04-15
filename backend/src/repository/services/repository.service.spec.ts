import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryService } from './repository.service';
import { RepositoryFindRepositoryToken } from '../interfaces/repository.find-repository.interface';
import { GitHubBranchesRepositoryToken } from '../interfaces/github.branches-repository.interface';
import type { RepositoryEntity } from '../entities/repository.entity';

const makeEntity = (
  overrides: Partial<RepositoryEntity> = {},
): RepositoryEntity => ({
  repositoryId: 'myRepositoryId',
  ownerName: 'myOwner',
  name: 'myRepo',
  ...overrides,
});

describe('RepositoryService', () => {
  let service: RepositoryService;
  let mockFindRepository: {
    getRepository: jest.Mock;
    getRepositories: jest.Mock;
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
    mockGitHubRepository = {
      getBranches: jest.fn(),
      verifyAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryService,
        {
          provide: RepositoryFindRepositoryToken,
          useValue: mockFindRepository,
        },
        {
          provide: GitHubBranchesRepositoryToken,
          useValue: mockGitHubRepository,
        },
      ],
    }).compile();

    service = module.get<RepositoryService>(RepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRepository', () => {
    it('returns a RepositoryInfo mapped from the entity', async () => {
      const entity = makeEntity({
        dateScan: new Date('2024-01-01T00:00:00.000Z'),
      });
      mockFindRepository.getRepository.mockResolvedValue(entity);

      const result = await service.getRepository('myRepositoryId');

      expect(mockFindRepository.getRepository).toHaveBeenCalledWith(
        'myRepositoryId',
      );
      expect(result).toEqual({
        repositoryId: entity.repositoryId,
        ownerName: entity.ownerName,
        name: entity.name,
        dateScan: '2024-01-01T00:00:00.000Z',
        documentationScore: undefined,
        codeCoverage: undefined,
        cvss: undefined,
      });
    });

    it('maps optional fields when present', async () => {
      const entity = makeEntity({
        documentationScore: 80,
        codeCoverage: 70,
        cvss: 5.5,
      });
      mockFindRepository.getRepository.mockResolvedValue(entity);

      const result = await service.getRepository('myRepositoryId');

      expect(result.documentationScore).toBe(80);
      expect(result.codeCoverage).toBe(70);
      expect(result.cvss).toBe(5.5);
    });

    it('leaves dateScan undefined when not set on entity', async () => {
      mockFindRepository.getRepository.mockResolvedValue(makeEntity());

      const result = await service.getRepository('myRepositoryId');

      expect(result.dateScan).toBeUndefined();
    });

    it('rejects when the repository rejects', async () => {
      mockFindRepository.getRepository.mockRejectedValue(
        new Error('Repository non trovata'),
      );

      await expect(service.getRepository('myRepositoryId')).rejects.toThrow(
        'Repository non trovata',
      );
    });
  });

  describe('getBranches', () => {
    it('returns the branches from GitHub', async () => {
      mockFindRepository.getRepository.mockResolvedValue(makeEntity());
      mockGitHubRepository.getBranches.mockResolvedValue(['main', 'develop']);

      const result = await service.getBranches('myRepositoryId');

      expect(mockFindRepository.getRepository).toHaveBeenCalledWith(
        'myRepositoryId',
      );
      expect(mockGitHubRepository.getBranches).toHaveBeenCalledWith(
        'myOwner',
        'myRepo',
      );
      expect(result).toEqual(['main', 'develop']);
    });

    it('rejects when the find-repository rejects', async () => {
      mockFindRepository.getRepository.mockRejectedValue(
        new Error('Repository non trovata'),
      );

      await expect(service.getBranches('myRepositoryId')).rejects.toThrow(
        'Repository non trovata',
      );
    });
  });
});
