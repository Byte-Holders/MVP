import { useQuery } from '@tanstack/react-query'
import { getMembersData } from '../model/getMembersData'

export function useGetMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => getMembersData(workspaceId),
    enabled: !!workspaceId,
  })
}
