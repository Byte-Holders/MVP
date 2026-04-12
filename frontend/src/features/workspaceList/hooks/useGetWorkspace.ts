import { useQuery } from '@tanstack/react-query'
import { getWorkspaces } from '../model/getWorkspacesApi'

export function useGetWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
    select: (workspaces) => workspaces.find((w) => w.id === workspaceId),
  })
}
