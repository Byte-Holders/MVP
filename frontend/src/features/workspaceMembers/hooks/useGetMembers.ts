import { useQuery } from '@tanstack/react-query'
import { getMembersRepository } from '../model/getMembersData'

export function useGetMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => getMembersRepository.getMembers(workspaceId),
    enabled: !!workspaceId,
  })
}
