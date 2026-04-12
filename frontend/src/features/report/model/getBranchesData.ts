import { fetchAuthSession } from 'aws-amplify/auth'

export async function getBranchesData(repositoryId: string): Promise<string[]> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch(`/api/repositories/${repositoryId}/branches`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (response.status === 404 || response.status === 403) return []
  if (!response.ok) throw new Error('Errore nel recupero dei branch')
  return response.json() as Promise<string[]>
}
