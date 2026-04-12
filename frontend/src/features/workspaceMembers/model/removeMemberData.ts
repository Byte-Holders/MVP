import { fetchAuthSession } from 'aws-amplify/auth'

export async function removeMemberData(
  workspaceId: string,
  userId: string,
): Promise<void> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch(
    `/api/workspace/${workspaceId}/users/${userId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!response.ok) throw new Error('Errore nella rimozione del membro')
}
