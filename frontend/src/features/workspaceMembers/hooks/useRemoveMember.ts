import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeMemberData } from '../model/removeMemberData'

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => removeMemberData(workspaceId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
    },
  })
}
