import { fetchAuthSession } from 'aws-amplify/auth'
import type { CreateWorkspaceRequest } from '../types/CreateWorkspace'
import type { WorkspaceResponse } from '../types/CreateWorkspaceResponse'

export async function createWorkspace(
  data: CreateWorkspaceRequest,
): Promise<WorkspaceResponse> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()
  const response = await fetch('/api/workspaces/', {
    //chiamata al backend per creare un nuovo workspace, con i dati del form e il token per l'autenticazione
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // il backend lo verifica con CognitoAuthGuard
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    // Leggi il messaggio di errore dal backend
    const errorBody = await response.json().catch(() => ({}))
    const message = errorBody?.message ?? 'Errore nella creazione del workspace'
    throw new Error(message) // il messaggio arriva dal ConflictException
  }

  return response.json()
}
