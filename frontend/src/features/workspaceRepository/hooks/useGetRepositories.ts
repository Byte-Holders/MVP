import { useQuery } from '@tanstack/react-query'
import { getRepositoriesData } from '../model/getRepositoriesData'

export function useGetRepositories(workspaceId: string) {
  return useQuery({
    queryKey: ['repositories', workspaceId],
    queryFn: () => getRepositoriesData(workspaceId),
    enabled: !!workspaceId,
  })
}
