import type { InviteAction } from '../../types'

export interface IManageInviteRepository {
  manageInvite(membershipId: string, action: InviteAction): Promise<void>
}
