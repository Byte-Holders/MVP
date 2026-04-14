import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryController } from './repository.controller';
import { RepositoryServiceToken } from '../interfaces/repository.service.interface';
import type { RepositoryInfo } from '../types/repository-info';

const makeRepositoryInfo = (
  overrides: Partial<RepositoryInfo> = {},
): RepositoryInfo => ({
  repositoryId: 'myRepositoryId',
  ownerName: 'myOwner',
  name: 'myRepo',
  branches: ['main', 'develop'],
  ...overrides,
});

describe('RepositoryController', () => {
  let controller: RepositoryController;
  let mockService: {
    getRepository: jest.Mock;
    getBranches: jest.Mock;
  };

  beforeEach(async () => {
    mockService = {
      getRepository: jest.fn(),
      getBranches: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepositoryController],
      providers: [
        { provide: RepositoryServiceToken, useValue: mockService },
      ],
    }).compile();

    controller = module.get<RepositoryController>(RepositoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRepository', () => {
    it('returns the repository info from the service', async () => {
      const info = makeRepositoryInfo();
      mockService.getRepository.mockResolvedValue(info);

      const result = await controller.getRepository('myRepositoryId');

      expect(mockService.getRepository).toHaveBeenCalledWith('myRepositoryId');
      expect(result).toEqual(info);
    });

    it('includes optional fields when present', async () => {
      const info = makeRepositoryInfo({
        dateScan: '2024-01-01T00:00:00.000Z',
        documentationScore: 90,
        codeCoverage: 75,
        cvss: 3.2,
      });
      mockService.getRepository.mockResolvedValue(info);

      const result = await controller.getRepository('myRepositoryId');

      expect(result.dateScan).toBe('2024-01-01T00:00:00.000Z');
      expect(result.documentationScore).toBe(90);
      expect(result.codeCoverage).toBe(75);
      expect(result.cvss).toBe(3.2);
    });

    it('rejects when the service rejects', async () => {
      mockService.getRepository.mockRejectedValue(
        new Error('Repository non trovata'),
      );

      await expect(
        controller.getRepository('myRepositoryId'),
      ).rejects.toThrow('Repository non trovata');
    });
  });

  describe('getBranches', () => {
    it('returns the branches from the service', async () => {
      mockService.getBranches.mockResolvedValue(['main', 'develop']);

      const result = await controller.getBranches('myRepositoryId');

      expect(mockService.getBranches).toHaveBeenCalledWith('myRepositoryId');
      expect(result).toEqual(['main', 'develop']);
    });

    it('returns an empty array when the repository has no branches', async () => {
      mockService.getBranches.mockResolvedValue([]);

      const result = await controller.getBranches('myRepositoryId');

      expect(result).toEqual([]);
    });

    it('rejects when the service rejects', async () => {
      mockService.getBranches.mockRejectedValue(
        new Error('Repository non trovata'),
      );

      await expect(
        controller.getBranches('myRepositoryId'),
      ).rejects.toThrow('Repository non trovata');
    });
  });
});
