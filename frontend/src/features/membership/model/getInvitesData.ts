import { fetchAuthSession } from 'aws-amplify/auth'
import type { Invite } from '../types'

export async function getInvitesData(): Promise<Invite[]> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  const response = await fetch('/api/membership/invites', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Errore nel recupero inviti')
  return response.json() as Promise<Invite[]>
}
