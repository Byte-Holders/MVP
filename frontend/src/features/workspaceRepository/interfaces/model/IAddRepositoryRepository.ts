import type { AddRepositoryRequest } from '../../types/repository'

export interface IAddRepositoryRepository {
  addRepository(workspaceId: string, data: AddRepositoryRequest): Promise<void>
}
