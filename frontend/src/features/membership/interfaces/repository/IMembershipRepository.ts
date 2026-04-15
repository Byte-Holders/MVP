import type { Invite, InviteAction } from '../../types'

export interface IMembershipRepository {
  getInvites(): Promise<Invite[]>
  manageInvite(membershipId: string, action: InviteAction): Promise<void>
}
