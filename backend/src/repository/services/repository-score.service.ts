import { Inject, Injectable } from '@nestjs/common';
import type { IRepositoryScoreWriter, RepositoryScores } from '../interfaces/repository.score-writer.interface';
import type { IRepositoryScoreRepository } from '../interfaces/repository.score-repository.interface';
import { RepositoryScoreRepositoryToken } from '../interfaces/repository.score-repository.interface';

@Injectable()
export class RepositoryScoreService implements IRepositoryScoreWriter {
  constructor(
    @Inject(RepositoryScoreRepositoryToken)
    private readonly repositoryScoreRepository: IRepositoryScoreRepository,
  ) {}

  async updateScores(
    repositoryId: string,
    scores: RepositoryScores,
  ): Promise<void> {
    return this.repositoryScoreRepository.updateScores(repositoryId, scores);
  }
}
