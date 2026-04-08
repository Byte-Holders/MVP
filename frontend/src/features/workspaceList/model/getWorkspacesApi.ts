import { fetchAuthSession } from 'aws-amplify/auth'
import type { WorkspaceListItem } from '../types/Workspace'

export async function getWorkspaces(): Promise<WorkspaceListItem[]> { //chiamata al backend per ottenere i workspace dell'utente, con gestione dell'autenticazione tramite token
  const session = await fetchAuthSession()
  const token   = session.tokens?.accessToken?.toString()

  const response = await fetch('/api/workspaces', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Errore nel recupero dei workspace')
  }

  return response.json()
}