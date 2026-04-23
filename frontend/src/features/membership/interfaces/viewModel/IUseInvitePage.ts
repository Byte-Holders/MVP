import type { InviteAction } from '../../types/index'
import type { InviteState } from '../../types/InviteState'

export interface IInvitePageViewModel extends InviteState {
  handleAction: (membershipId: string, action: InviteAction) => void
}
