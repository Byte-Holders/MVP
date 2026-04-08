import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addRepositoryData } from '../model/addRepositoryData'
import type { AddRepositoryRequest } from '../types/repository'

export function useAddRepository(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddRepositoryRequest) => addRepositoryData(workspaceId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['repositories', workspaceId],
      })
    },
  })
}
