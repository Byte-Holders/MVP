import { useGetInvites } from './useGetInvites'
import { useManageInvite } from './useManageInvite'
import type { InviteAction } from '../types'

export function useInvitePage() {
  const { data: invites = [], isLoading } = useGetInvites()
  const { mutate: manage, isPending } = useManageInvite()

  function handleAction(membershipId: string, action: InviteAction) {
    manage({ membershipId, action })
  }

  return { invites, isLoading, isPending, handleAction }
}
