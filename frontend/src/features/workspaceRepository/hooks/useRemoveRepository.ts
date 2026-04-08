import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeRepositoryData } from '../model/removeRepositoryData'

export function useRemoveRepository(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ repositoryId }: { repositoryId: string }) =>
      removeRepositoryData(workspaceId, repositoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['repositories', workspaceId],
      })
    },
  })
}
