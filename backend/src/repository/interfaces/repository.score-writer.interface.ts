export type RepositoryScores = {
  documentationScore?: number;
  cvss?: number;
  codeCoverage?: number;
  dateScan?: Date;
};

export interface IRepositoryScoreWriter {
  updateScores(
    ownerName: string,
    name: string,
    scores: RepositoryScores,
  ): Promise<void>;
}

export const RepositoryScoreWriterToken = 'REPOSITORY_SCORE_WRITER';
