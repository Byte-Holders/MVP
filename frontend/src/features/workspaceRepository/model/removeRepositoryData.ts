import { fetchAuthSession } from 'aws-amplify/auth'

export async function removeRepositoryData(
  workspaceId: string,
  repoId: string,
): Promise<void> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch(
    `/api/workspaces/${workspaceId}/repositories/${repoId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!response.ok) throw new Error('Errore nella rimozione del repository')
}
