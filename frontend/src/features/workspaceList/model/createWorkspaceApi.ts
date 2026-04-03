import { fetchAuthSession } from 'aws-amplify/auth'
import type { CreateWorkspaceRequest} from '../types/CreateWorkspace'
import type { WorkspaceResponse } from '../types/CreateWorkspaceResponse'

export async function createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()
  console.log('Token ottenuto da fetchAuthSession:', token) // Debug log per verificare il token
  const response = await fetch('/api/workspaces/', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  // ← il backend lo verifica con CognitoAuthGuard
    },
    body: JSON.stringify(data),
  })
  console.log('Risposta raw dal backend:', response) // Debug log per verificare la risposta
  if (!response.ok) throw new Error('Errore nella creazione del workspace')

  return response.json()
}