import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeMemberRepository } from '../model/removeMemberData'

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      removeMemberRepository.removeMember(workspaceId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
    },
  })
}
