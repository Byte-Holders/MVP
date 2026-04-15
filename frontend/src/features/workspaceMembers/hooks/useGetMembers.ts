import { useQuery } from '@tanstack/react-query'
import { workspaceMembersRepository } from '../model/workspaceMembersRepository'

export function useGetMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => workspaceMembersRepository.getMembers(workspaceId),
    enabled: !!workspaceId,
  })
}
