import { useMutation, useQueryClient } from '@tanstack/react-query'
import { manageInviteRepository } from '../model/manageInviteData'
import type { InviteAction } from '../types'

export function useManageInvite() {
  const queryClient = useQueryClient()

  return useMutation({
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
}
