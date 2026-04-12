import { fetchAuthSession } from 'aws-amplify/auth'
import type { WorkspaceRole } from '../types/workspaceMember'

export async function inviteMemberData(
  workspaceId: string,
  recipientUsername: string,
  recipientRole: WorkspaceRole,
): Promise<void> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch('/api/membership/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ workspaceId, recipientUsername, recipientRole }),
  })
  if (!response.ok) throw new Error("Errore nell'invio dell'invito")
}
