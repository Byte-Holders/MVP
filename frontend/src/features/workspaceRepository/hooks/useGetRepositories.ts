import { useQuery } from '@tanstack/react-query'
import { getRepositoriesRepository } from '../model/getRepositoriesData'

export function useGetRepositories(workspaceId: string, searchInput?: string) {
  return useQuery({
    queryKey: ['repositories', workspaceId, searchInput],
    queryFn: () =>
      getRepositoriesRepository.getRepositories(workspaceId, searchInput),
    enabled: !!workspaceId,
  })
}
