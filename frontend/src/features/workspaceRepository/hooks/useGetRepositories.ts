import { useQuery } from '@tanstack/react-query'
import { getRepositoriesData } from '../model/getRepositoriesData'

export function useGetRepositories(workspaceId: string, searchInput?: string) {
  return useQuery({
    queryKey: ['repositories', workspaceId, searchInput],
    queryFn: () => getRepositoriesData(workspaceId, searchInput),
    enabled: !!workspaceId,
  })
}
