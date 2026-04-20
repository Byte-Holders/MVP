import type { RepositoryInWorkspace } from '../../types/repository'

export interface IGetRepositoryRepository {
  getRepository(repositoryId: string): Promise<RepositoryInWorkspace>
}
