import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeRepositoryRepository } from '../model/removeRepositoryData'

export function useRemoveRepository(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ repositoryId }: { repositoryId: string }) =>
      removeRepositoryRepository.removeRepository(workspaceId, repositoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['repositories', workspaceId],
      })
    },
  })
}
