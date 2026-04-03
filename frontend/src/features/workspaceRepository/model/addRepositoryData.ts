import type { AddRepositoryRequest } from '../types/repository'

const BASE_URL = 'http://localhost:3001'

export async function addRepositoryData(
  data: AddRepositoryRequest,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/workspace-repository`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Errore nell'aggiunta del repository")
}
