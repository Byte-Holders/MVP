import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryReaderService } from './repository-reader.service';
import { RepositoryFindRepositoryToken } from '../interfaces/repository.find-repository.interface';
import type { RepositoryEntity } from '../entities/repository.entity';

const makeEntity = (
  overrides: Partial<RepositoryEntity> = {},
): RepositoryEntity => ({
  repositoryId: 'myRepositoryId',
  ownerName: 'myOwner',
  name: 'myRepo',
  ...overrides,
});

describe('RepositoryReaderService', () => {
  let service: RepositoryReaderService;
  let mockFindRepository: {
    getRepository: jest.Mock;
    getRepositories: jest.Mock;
  };

  beforeEach(async () => {
    mockFindRepository = {
      getRepository: jest.fn(),
      getRepositories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryReaderService,
        {
          provide: RepositoryFindRepositoryToken,
          useValue: mockFindRepository,
        },
      ],
    }).compile();

    service = module.get<RepositoryReaderService>(RepositoryReaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRepositories', () => {
    it('returns mapped RepositoryInfo for each entity', async () => {
      const entities = [
        makeEntity({ repositoryId: 'id1', name: 'repo1' }),
        makeEntity({ repositoryId: 'id2', name: 'repo2' }),
      ];
      mockFindRepository.getRepositories.mockResolvedValue(entities);

      const result = await service.getRepositories(['id1', 'id2']);

      expect(mockFindRepository.getRepositories).toHaveBeenCalledWith(
        ['id1', 'id2'],
        undefined,
      );
      expect(result).toHaveLength(2);
      expect(result[0].repositoryId).toBe('id1');
      expect(result[1].repositoryId).toBe('id2');
    });

    it('maps all fields including optional ones', async () => {
      const entity = makeEntity({
        dateScan: new Date('2024-01-01T00:00:00.000Z'),
        documentationScore: 80,
        codeCoverage: 70,
        cvss: 5.5,
      });
      mockFindRepository.getRepositories.mockResolvedValue([entity]);

      const result = await service.getRepositories(['myRepositoryId']);

      expect(result[0]).toEqual({
        repositoryId: entity.repositoryId,
        ownerName: entity.ownerName,
        name: entity.name,
        dateScan: '2024-01-01T00:00:00.000Z',
        documentationScore: 80,
        codeCoverage: 70,
        cvss: 5.5,
      });
    });

    it('leaves dateScan undefined when not set on entity', async () => {
      mockFindRepository.getRepositories.mockResolvedValue([makeEntity()]);

      const result = await service.getRepositories(['myRepositoryId']);

      expect(result[0].dateScan).toBeUndefined();
    });

    it('forwards the searchInput to the repository', async () => {
      mockFindRepository.getRepositories.mockResolvedValue([]);

      await service.getRepositories(['id1'], 'mySearch');

      expect(mockFindRepository.getRepositories).toHaveBeenCalledWith(
        ['id1'],
        'mySearch',
      );
    });

    it('returns an empty array when the repository returns none', async () => {
      mockFindRepository.getRepositories.mockResolvedValue([]);

      const result = await service.getRepositories(['id1']);

      expect(result).toEqual([]);
    });

    it('rejects when the repository rejects', async () => {
      mockFindRepository.getRepositories.mockRejectedValue(
        new Error('db error'),
      );

      await expect(service.getRepositories(['id1'])).rejects.toThrow(
        'db error',
      );
    });
  });
});
