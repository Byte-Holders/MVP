import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceMembersRepository } from '../model/workspaceMembersRepository'

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      workspaceMembersRepository.removeMember(workspaceId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
    },
  })
}
