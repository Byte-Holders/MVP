import { apiGet, apiPost } from '../../../api/apiClient'
import type { IMembershipRepository } from '../interfaces/repository/IMembershipRepository'
import type { Invite, InviteAction } from '../types'

class MembershipRepository implements IMembershipRepository {
  async getInvites(): Promise<Invite[]> {
    return apiGet<Invite[]>('/api/membership/invites')
  }

  async manageInvite(membershipId: string, action: InviteAction): Promise<void> {
    return apiPost('/api/membership/manage', { membershipId, action })
  }
}

export const membershipRepository: IMembershipRepository = new MembershipRepository()
