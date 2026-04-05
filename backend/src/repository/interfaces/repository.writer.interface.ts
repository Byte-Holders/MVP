import type { AddRepositoryDto } from '../dtos/AddRepositoryDto';

export interface IRepositoryWriter {
  addRepository(dto: AddRepositoryDto): Promise<string>;
}

export const RepositoryWriterToken = 'REPOSITORY_WRITER';
