import type { CreateWorkspaceRequest} from '../types/CreateWorkspace'
import type { WorkspaceResponse } from '../types/CreateWorkspaceResponse'

export async function createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
  const response = await fetch('/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) throw new Error('Errore nella creazione del workspace')

  return response.json()
}