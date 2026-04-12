import type { RepositoryScores } from './repository.score-writer.interface';

export interface IRepositoryScoreRepository {
  updateScores(repositoryId: string, scores: RepositoryScores): Promise<void>;
}

export const RepositoryScoreRepositoryToken = 'REPOSITORY_SCORE_REPOSITORY';
