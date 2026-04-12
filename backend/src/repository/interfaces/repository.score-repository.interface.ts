import type { RepositoryScores } from './repository.score-writer.interface';

export interface IRepositoryScoreRepository {
  updateScores(ownerName: string, name: string, scores: RepositoryScores): Promise<void>;
}

export const RepositoryScoreRepositoryToken = 'REPOSITORY_SCORE_REPOSITORY';
