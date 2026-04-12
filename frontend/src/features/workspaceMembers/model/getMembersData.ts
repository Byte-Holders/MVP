import { fetchAuthSession } from 'aws-amplify/auth'
import type { WorkspaceMember } from '../types/workspaceMember'

export async function getMembersData(workspaceId: string): Promise<WorkspaceMember[]> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch(`/api/workspace/${workspaceId}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Errore nel recupero dei membri')
  return response.json() as Promise<WorkspaceMember[]>
}
