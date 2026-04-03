import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeRepositoryData } from '../model/removeRepositoryData'

export function useRemoveRepository(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ repoId }: { repoId: string }) =>
      removeRepositoryData(workspaceId, repoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['repositories', workspaceId],
      })
    },
  })
}
