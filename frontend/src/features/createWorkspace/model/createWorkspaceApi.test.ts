import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWorkspaceRepository } from './createWorkspaceApi'

vi.mock('../../../api/apiClient', () => ({ apiPost: vi.fn() }))

import { apiPost } from '../../../api/apiClient'

describe('createWorkspaceRepository', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chiama POST /api/workspaces/ e restituisce il workspace creato', async () => {
    const response = { id: 'ws-1', name: 'My Workspace' }
    vi.mocked(apiPost).mockResolvedValue(response)

    const result = await createWorkspaceRepository.createWorkspace({
      name: 'My Workspace',
    })

    expect(apiPost).toHaveBeenCalledWith('/api/workspaces/', {
      name: 'My Workspace',
    })
    expect(result).toEqual(response)
  })

  it("propaga l'errore se apiPost fallisce", async () => {
    vi.mocked(apiPost).mockRejectedValue(new Error('Conflict'))
    await expect(
      createWorkspaceRepository.createWorkspace({ name: 'Test' }),
    ).rejects.toThrow('Conflict')
  })
})
