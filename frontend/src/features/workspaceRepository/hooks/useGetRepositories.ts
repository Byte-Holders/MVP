import { useQuery } from '@tanstack/react-query'
import { workspaceRepositoryRepository } from '../model/workspaceRepositoryRepository'

export function useGetRepositories(workspaceId: string, searchInput?: string) {
  return useQuery({
    queryKey: ['repositories', workspaceId, searchInput],
    queryFn: () =>
      workspaceRepositoryRepository.getRepositories(workspaceId, searchInput),
    enabled: !!workspaceId,
  })
}
