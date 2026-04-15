import { describe, it, expect, vi, beforeEach } from 'vitest'
import { workspaceListRepository } from './getWorkspacesApi'

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(),
}))

import { apiGet } from '../../../api/apiClient'

describe('workspaceListRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe chiamare apiGet con il percorso corretto', async () => {
    const mockWorkspaces = [
      { id: 'ws-1', name: 'Alpha', owner: 'alice', role: 'owner' },
    ]
    vi.mocked(apiGet).mockResolvedValue(mockWorkspaces)
    const result = await workspaceListRepository.getWorkspaces()
    expect(apiGet).toHaveBeenCalledWith('/api/workspaces')
    expect(result).toEqual(mockWorkspaces)
  })

  it('dovrebbe restituire una lista vuota se non ci sono workspace', async () => {
    vi.mocked(apiGet).mockResolvedValue([])
    const result = await workspaceListRepository.getWorkspaces()
    expect(result).toEqual([])
  })

  it('dovrebbe propagare gli errori della API', async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error('Non autorizzato'))
    await expect(workspaceListRepository.getWorkspaces()).rejects.toThrow(
      'Non autorizzato',
    )
  })
})
