import type { Invite, InviteAction } from '../../types/index'

export interface IInvitePageViewModel {
  invites: Invite[]
  isLoading: boolean
  isPending: boolean
  handleAction: (membershipId: string, action: InviteAction) => void
}
