const BASE_URL = 'http://localhost:3001'

export async function removeRepositoryData(
  workspaceId: string,
  repoId: string,
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/workspaces/${workspaceId}/repositories/${repoId}`,
    { method: 'DELETE' },
  )
  if (!response.ok) throw new Error('Errore nella rimozione del repository')
}
