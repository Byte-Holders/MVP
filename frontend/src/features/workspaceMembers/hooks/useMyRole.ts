import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from 'aws-amplify/auth'
import { workspaceMembersRepository } from '../model/workspaceMembersRepository'
import type { WorkspaceRole } from '../types/workspaceMember'

export function useMyRole(workspaceId: string) {
  return useQuery({
    queryKey: ['myRole', workspaceId],
    queryFn: async (): Promise<WorkspaceRole | null> => {
      const [{ userId }, members] = await Promise.all([
        getCurrentUser(),
        workspaceMembersRepository.getMembers(workspaceId),
      ])
      const me = members.find((m) => m.userId === userId)
      return (me?.role as WorkspaceRole) ?? null
    },
    enabled: !!workspaceId,
  })
}
