import { useState } from 'react'
import { deleteWorkspaceRepository } from '../model/deleteWorkspace.api'
import type { IDeleteWorkspaceRepository } from '../interfaces/model/IDeleteWorkspaceRepository'
import type { IUseDeleteWorkspaceViewModel } from '../interfaces/viewModel/IUseDeleteWorkspace'

export function useDeleteWorkspace(
  repo: IDeleteWorkspaceRepository = deleteWorkspaceRepository,
): IUseDeleteWorkspaceViewModel {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (workspaceId: string) => {
    setLoading(true)
    setError(null)

    try {
      await repo.deleteWorkspace({ workspaceId })
    } catch (err: any) {
      setError(err.message ?? 'Errore eliminazione workspace')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading, error }
}
