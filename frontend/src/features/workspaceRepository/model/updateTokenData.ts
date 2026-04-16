import { apiPatch } from '../../../api/apiClient'
import type { IUpdateTokenRepository } from '../interfaces/model/IUpdateTokenRepository'

class UpdateTokenRepository implements IUpdateTokenRepository {
  async updateToken(
    workspaceId: string,
    repositoryId: string,
    accessToken: string,
  ): Promise<void> {
    return apiPatch(
      `/api/workspaces/${workspaceId}/repositories/${repositoryId}`,
      { accessToken },
    )
  }
}

export const updateTokenRepository: IUpdateTokenRepository =
  new UpdateTokenRepository()
