import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInvitesRepository } from '../model/getInvitesData'
import { manageInviteRepository } from '../model/manageInviteData'
import type { InviteAction } from '../types'
import type { IInvitePageViewModel } from '../interfaces/viewModel/IUseInvitePage'

export function useInvitePage(): IInvitePageViewModel {
  const queryClient = useQueryClient()

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: () => getInvitesRepository.getInvites(),
  })

  const { mutate: manage, isPending } = useMutation({
    mutationFn: ({
      membershipId,
      action,
    }: {
      membershipId: string
      action: InviteAction
    }) => manageInviteRepository.manageInvite(membershipId, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invites'] })
    },
  })

  function handleAction(membershipId: string, action: InviteAction) {
    manage({ membershipId, action })
  }

  return { invites, isLoading, isPending, handleAction }
}
