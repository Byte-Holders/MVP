import { describe, it, expect, vi, beforeEach } from 'vitest'
import { removeRepositoryRepository } from './removeRepositoryData'

vi.mock('../../../api/apiClient', () => ({
  apiDelete: vi.fn(),
}))

import { apiDelete } from '../../../api/apiClient'

describe('removeRepositoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe chiamare apiDelete con il percorso corretto', async () => {
    vi.mocked(apiDelete).mockResolvedValue(undefined)
    await removeRepositoryRepository.removeRepository('ws-1', 'repo-1')
    expect(apiDelete).toHaveBeenCalledWith('/api/workspaces/ws-1/repositories/repo-1')
  })

  it('dovrebbe propagare gli errori della API', async () => {
    vi.mocked(apiDelete).mockRejectedValue(new Error('Repository non trovato'))
    await expect(
      removeRepositoryRepository.removeRepository('ws-1', 'repo-x'),
    ).rejects.toThrow('Repository non trovato')
  })
})
