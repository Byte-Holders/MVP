import { useMutation, useQueryClient } from '@tanstack/react-query'
import { manageInviteData } from '../model/manageInviteData'
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
    }) => manageInviteData(membershipId, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invites'] })
    },
  })
}
