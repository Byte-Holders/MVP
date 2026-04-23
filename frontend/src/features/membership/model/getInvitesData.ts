import { apiGet } from '../../../api/apiClient'
import type { IGetInvitesRepository } from '../interfaces/model/IGetInvitesRepository'
import type { Invite } from '../types'

class GetInvitesRepository implements IGetInvitesRepository {
  async getInvites(): Promise<Invite[]> {
    return apiGet<Invite[]>('/api/invitations')
  }
}

export const getInvitesRepository: IGetInvitesRepository =
  new GetInvitesRepository()
