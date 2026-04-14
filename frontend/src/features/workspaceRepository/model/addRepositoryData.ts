import { fetchAuthSession } from 'aws-amplify/auth'
import type { AddRepositoryRequest } from '../types/repository'

export async function addRepositoryData(
  workspaceId: string,
  data: AddRepositoryRequest,
): Promise<void> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch(`/api/workspaces/${workspaceId}/repositories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Errore nell'aggiunta del repository")
}
