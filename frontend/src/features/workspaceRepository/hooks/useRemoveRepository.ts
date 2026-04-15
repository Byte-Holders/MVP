import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceRepositoryRepository } from '../model/workspaceRepositoryRepository'

export function useRemoveRepository(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ repositoryId }: { repositoryId: string }) =>
      workspaceRepositoryRepository.removeRepository(workspaceId, repositoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['repositories', workspaceId],
      })
    },
  })
}
