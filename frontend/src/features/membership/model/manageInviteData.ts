import { fetchAuthSession } from 'aws-amplify/auth'
import type { InviteAction } from '../types'

export async function manageInviteData(
  membershipId: string,
  action: InviteAction,
): Promise<void> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch('/api/membership/manage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ membershipId, action }),
  })
  if (!response.ok) throw new Error(`Errore durante l'azione: ${action}`)
}
