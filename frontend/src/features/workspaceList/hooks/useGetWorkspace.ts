import { useQuery } from '@tanstack/react-query'
import { workspaceListRepository } from '../model/getWorkspacesApi'

export function useGetWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceListRepository.getWorkspaces(),
    select: (workspaces) => workspaces.find((w) => w.id === workspaceId),
  })
}
