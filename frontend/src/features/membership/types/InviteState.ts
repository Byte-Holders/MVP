import type { Invite } from './index'

export type InviteState = {
  invites: Invite[]
  isLoading: boolean
  isPending: boolean
}
