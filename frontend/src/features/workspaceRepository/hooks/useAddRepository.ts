import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceRepositoryRepository } from '../model/workspaceRepositoryRepository'
import type { AddRepositoryRequest } from '../types/repository'

export function useAddRepository(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddRepositoryRequest) =>
      workspaceRepositoryRepository.addRepository(workspaceId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['repositories', workspaceId],
      })
    },
  })
}
