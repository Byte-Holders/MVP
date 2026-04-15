import { useGetInvites } from './useGetInvites'
import { useManageInvite } from './useManageInvite'
import type { InviteAction } from '../types'
import type { IInvitePageViewModel } from '../interfaces/viewModel/IUseInvitePage'

export function useInvitePage(): IInvitePageViewModel {
  const { data: invites = [], isLoading } = useGetInvites()
  const { mutate: manage, isPending } = useManageInvite()

  function handleAction(membershipId: string, action: InviteAction) {
    manage({ membershipId, action })
  }

  return { invites, isLoading, isPending, handleAction }
}
