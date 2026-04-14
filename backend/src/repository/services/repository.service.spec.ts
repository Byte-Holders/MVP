import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryService } from './repository.service';
import { RepositoryRepositoryToken } from '../interfaces/repository.repository.interface';
import type { RepositoryEntity } from '../entities/repository.entity';

const makeEntity = (
  overrides: Partial<RepositoryEntity> = {},
): RepositoryEntity => ({
  repositoryId: 'myRepositoryId',
  ownerName: 'myOwner',
  name: 'myRepo',
  branches: ['main', 'develop'],
  ...overrides,
});

describe('RepositoryService', () => {
  let service: RepositoryService;
  let mockRepository: {
    getRepositories: jest.Mock;
    getRepository: jest.Mock;
    getBranches: jest.Mock;
    addRepository: jest.Mock;
  };

  beforeEach(async () => {
    mockRepository = {
      getRepositories: jest.fn(),
      getRepository: jest.fn(),
      getBranches: jest.fn(),
      addRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryService,
        { provide: RepositoryRepositoryToken, useValue: mockRepository },
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
      mockRepository.getRepository.mockResolvedValue(entity);

      const result = await service.getRepository('myRepositoryId');

      expect(mockRepository.getRepository).toHaveBeenCalledWith(
        'myRepositoryId',
      );
      expect(result).toEqual({
        repositoryId: entity.repositoryId,
        ownerName: entity.ownerName,
        name: entity.name,
        branches: entity.branches,
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
      mockRepository.getRepository.mockResolvedValue(entity);

      const result = await service.getRepository('myRepositoryId');

      expect(result.documentationScore).toBe(80);
      expect(result.codeCoverage).toBe(70);
      expect(result.cvss).toBe(5.5);
    });

    it('leaves dateScan undefined when not set on entity', async () => {
      mockRepository.getRepository.mockResolvedValue(makeEntity());

      const result = await service.getRepository('myRepositoryId');

      expect(result.dateScan).toBeUndefined();
    });

    it('rejects when the repository rejects', async () => {
      mockRepository.getRepository.mockRejectedValue(
        new Error('Repository non trovata'),
      );

      await expect(service.getRepository('myRepositoryId')).rejects.toThrow(
        'Repository non trovata',
      );
    });
  });

  describe('getBranches', () => {
    it('returns the branches from the repository', async () => {
      mockRepository.getBranches.mockResolvedValue(['main', 'develop']);

      const result = await service.getBranches('myRepositoryId');

      expect(mockRepository.getBranches).toHaveBeenCalledWith('myRepositoryId');
      expect(result).toEqual(['main', 'develop']);
    });

    it('rejects when the repository rejects', async () => {
      mockRepository.getBranches.mockRejectedValue(
        new Error('Repository non trovata'),
      );

      await expect(service.getBranches('myRepositoryId')).rejects.toThrow(
        'Repository non trovata',
      );
    });
  });

  describe('getRepositories', () => {
    it('returns mapped RepositoryInfo for each entity', async () => {
      const entities = [
        makeEntity({ repositoryId: 'id1', name: 'repo1' }),
        makeEntity({ repositoryId: 'id2', name: 'repo2' }),
      ];
      mockRepository.getRepositories.mockResolvedValue(entities);

      const result = await service.getRepositories(['id1', 'id2']);

      expect(mockRepository.getRepositories).toHaveBeenCalledWith(
        ['id1', 'id2'],
        undefined,
      );
      expect(result).toHaveLength(2);
      expect(result[0].repositoryId).toBe('id1');
      expect(result[1].repositoryId).toBe('id2');
    });

    it('forwards the searchInput to the repository', async () => {
      mockRepository.getRepositories.mockResolvedValue([]);

      await service.getRepositories(['id1'], 'mySearch');

      expect(mockRepository.getRepositories).toHaveBeenCalledWith(
        ['id1'],
        'mySearch',
      );
    });

    it('returns an empty array when the repository returns none', async () => {
      mockRepository.getRepositories.mockResolvedValue([]);

      const result = await service.getRepositories(['id1']);

      expect(result).toEqual([]);
    });

    it('rejects when the repository rejects', async () => {
      mockRepository.getRepositories.mockRejectedValue(new Error('db error'));

      await expect(service.getRepositories(['id1'])).rejects.toThrow(
        'db error',
      );
    });
  });

  describe('addRepository', () => {
    it('returns the id from the repository', async () => {
      mockRepository.addRepository.mockResolvedValue('newRepoId');

      const result = await service.addRepository(
        'https://github.com/owner/repo',
        'myToken',
      );

      expect(mockRepository.addRepository).toHaveBeenCalledWith(
        'https://github.com/owner/repo',
        'myToken',
      );
      expect(result).toBe('newRepoId');
    });

    it('works without an access token', async () => {
      mockRepository.addRepository.mockResolvedValue('newRepoId');

      await service.addRepository('https://github.com/owner/repo');

      expect(mockRepository.addRepository).toHaveBeenCalledWith(
        'https://github.com/owner/repo',
        undefined,
      );
    });

    it('rejects when the repository rejects', async () => {
      mockRepository.addRepository.mockRejectedValue(new Error('db error'));

      await expect(
        service.addRepository('https://github.com/owner/repo'),
      ).rejects.toThrow('db error');
    });
  });
});
