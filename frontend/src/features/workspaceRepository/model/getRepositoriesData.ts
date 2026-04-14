import { fetchAuthSession } from 'aws-amplify/auth'
import type { RepositoryInWorkspace } from '../types/repository'

export async function getRepositoriesData(
  workspaceId: string,
  searchInput?: string,
): Promise<RepositoryInWorkspace[]> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const url = new URL(
    `/api/workspaces/${workspaceId}/repositories`,
    window.location.origin,
  )
  if (searchInput) url.searchParams.set('searchInput', searchInput)

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Errore nel recupero dei repository')
  return response.json() as Promise<RepositoryInWorkspace[]>
}
