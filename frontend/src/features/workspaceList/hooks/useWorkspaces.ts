import { useEffect, useState } from 'react'
import { workspaceListRepository } from '../model/getWorkspacesApi'
import type { IWorkspaceListRepository } from '../interfaces/repository/IWorkspaceListRepository'
import type { WorkspaceListItem } from '../types/Workspace'
import type { IWorkspacesViewModel } from '../interfaces/IUseWorkspaces'

export function useWorkspaces(
  repo: IWorkspaceListRepository = workspaceListRepository,
): IWorkspacesViewModel {
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    repo
      .getWorkspaces()
      .then(setWorkspaces)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  function refresh() {
    setIsLoading(true)
    repo
      .getWorkspaces()
      .then(setWorkspaces)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }

  return { workspaces, isLoading, error, refresh }
}
