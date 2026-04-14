import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryScoreService } from './repository-score.service';
import { RepositoryScoreRepositoryToken } from '../interfaces/repository.score-repository.interface';
import type { RepositoryScores } from '../interfaces/repository.score-writer.interface';

describe('RepositoryScoreService', () => {
  let service: RepositoryScoreService;
  let mockScoreRepository: {
    updateScores: jest.Mock;
  };

  beforeEach(async () => {
    mockScoreRepository = {
      updateScores: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryScoreService,
        {
          provide: RepositoryScoreRepositoryToken,
          useValue: mockScoreRepository,
        },
      ],
    }).compile();

    service = module.get<RepositoryScoreService>(RepositoryScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateScores', () => {
    it('delegates to the score repository', async () => {
      mockScoreRepository.updateScores.mockResolvedValue(undefined);
      const scores: RepositoryScores = {
        documentationScore: 80,
        codeCoverage: 70,
        cvss: 5.5,
        dateScan: new Date('2024-01-01T00:00:00.000Z'),
      };

      await service.updateScores('myRepositoryId', scores);

      expect(mockScoreRepository.updateScores).toHaveBeenCalledWith(
        'myRepositoryId',
        scores,
      );
    });

    it('works with partial scores', async () => {
      mockScoreRepository.updateScores.mockResolvedValue(undefined);

      await service.updateScores('myRepositoryId', { cvss: 3.0 });

      expect(mockScoreRepository.updateScores).toHaveBeenCalledWith(
        'myRepositoryId',
        { cvss: 3.0 },
      );
    });

    it('rejects when the score repository rejects', async () => {
      mockScoreRepository.updateScores.mockRejectedValue(
        new Error('db error'),
      );

      await expect(
        service.updateScores('myRepositoryId', {}),
      ).rejects.toThrow('db error');
    });
  });
});
