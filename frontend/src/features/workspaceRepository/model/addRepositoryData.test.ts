import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addRepositoryRepository } from './addRepositoryData'

vi.mock('../../../api/apiClient', () => ({
  apiPost: vi.fn(),
}))

import { apiPost } from '../../../api/apiClient'

describe('addRepositoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe chiamare apiPost con il percorso e i dati corretti', async () => {
    vi.mocked(apiPost).mockResolvedValue(undefined)
    await addRepositoryRepository.addRepository('ws-1', {
      repositoryUrl: 'https://github.com/org/repo',
    })
    expect(apiPost).toHaveBeenCalledWith('/api/workspaces/ws-1/repositories', {
      repositoryUrl: 'https://github.com/org/repo',
    })
  })

  it('dovrebbe passare il token di accesso se fornito', async () => {
    vi.mocked(apiPost).mockResolvedValue(undefined)
    await addRepositoryRepository.addRepository('ws-1', {
      repositoryUrl: 'https://github.com/org/private-repo',
      accessToken: 'ghp_token123',
    })
    expect(apiPost).toHaveBeenCalledWith('/api/workspaces/ws-1/repositories', {
      repositoryUrl: 'https://github.com/org/private-repo',
      accessToken: 'ghp_token123',
    })
  })

  it('dovrebbe propagare gli errori della API', async () => {
    vi.mocked(apiPost).mockRejectedValue(new Error('Repository già aggiunto'))
    await expect(
      addRepositoryRepository.addRepository('ws-1', {
        repositoryUrl: 'https://github.com/org/repo',
      }),
    ).rejects.toThrow('Repository già aggiunto')
  })
})
