import type { RepositoryInWorkspace } from '../types/repository'

const BASE_URL = 'http://localhost:3001'

export async function getRepositoriesData(
  workspaceId: string,
): Promise<RepositoryInWorkspace[]> {
  const response = await fetch(
    `${BASE_URL}/workspaces/${workspaceId}/repositories`,
  )
  if (!response.ok) throw new Error('Errore nel recupero dei repository')
  return response.json() as Promise<RepositoryInWorkspace[]>
}
