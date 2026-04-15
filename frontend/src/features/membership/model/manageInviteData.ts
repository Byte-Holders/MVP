import { apiPost } from '../../../api/apiClient'
import type { IManageInviteRepository } from '../interfaces/model/IManageInviteRepository'
import type { InviteAction } from '../types'

class ManageInviteRepository implements IManageInviteRepository {
  async manageInvite(membershipId: string, action: InviteAction): Promise<void> {
    return apiPost('/api/membership/manage', { membershipId, action })
  }
}

export const manageInviteRepository: IManageInviteRepository = new ManageInviteRepository()
