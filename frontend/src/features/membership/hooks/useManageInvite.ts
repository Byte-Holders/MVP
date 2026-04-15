import { useMutation, useQueryClient } from '@tanstack/react-query'
import { membershipRepository } from '../model/membershipRepository'
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
    }) => membershipRepository.manageInvite(membershipId, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invites'] })
    },
  })
}
