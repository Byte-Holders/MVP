import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteWorkspaceRepository } from './deleteWorkspace.api'

vi.mock('@/api/apiClient', () => ({
  apiDelete: vi.fn(),
}))

import { apiDelete } from '@/api/apiClient'

describe('deleteWorkspaceRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chiama DELETE /api/workspaces/:id con il workspaceId corretto', async () => {
    vi.mocked(apiDelete).mockResolvedValue(undefined)

    await deleteWorkspaceRepository.deleteWorkspace({ workspaceId: 'ws-1' })

    expect(apiDelete).toHaveBeenCalledWith('/api/workspaces/ws-1')
  })

  it('propaga gli errori 403 (solo il proprietario può eliminare)', async () => {
    vi.mocked(apiDelete).mockRejectedValue(
      new Error('Solo il proprietario può cancellare il workspace'),
    )

    await expect(
      deleteWorkspaceRepository.deleteWorkspace({ workspaceId: 'ws-1' }),
    ).rejects.toThrow('Solo il proprietario può cancellare il workspace')
  })

  it('propaga gli errori 404 (workspace non trovato)', async () => {
    vi.mocked(apiDelete).mockRejectedValue(new Error('Workspace non trovato'))

    await expect(
      deleteWorkspaceRepository.deleteWorkspace({
        workspaceId: 'ws-inesistente',
      }),
    ).rejects.toThrow('Workspace non trovato')
  })
})
