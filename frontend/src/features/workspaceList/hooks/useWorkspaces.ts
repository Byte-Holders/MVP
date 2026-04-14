import { useEffect, useState } from 'react'
import { getWorkspaces } from '../model/getWorkspacesApi'
import type { WorkspaceListItem } from '../types/Workspace'
import type { IWorkspacesViewModel } from '../interfaces/IUseWorkspaces'

export function useWorkspaces(): IWorkspacesViewModel {
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    //chiama l'API per ottenere i workspace dell'utente
    getWorkspaces()
      .then(setWorkspaces)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  // esposto per aggiornare la lista dopo una creazione
  function refresh() {
    setIsLoading(true)
    getWorkspaces()
      .then(setWorkspaces)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }

  return { workspaces, isLoading, error, refresh }
}
