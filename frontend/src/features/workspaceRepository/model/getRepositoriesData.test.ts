import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRepositoriesRepository } from './getRepositoriesData'

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(),
}))

import { apiGet } from '../../../api/apiClient'

const mockRepos = [
  { repositoryId: 'r-1', name: 'repo-a', ownerName: 'alice' },
  { repositoryId: 'r-2', name: 'repo-b', ownerName: 'alice' },
]

describe('getRepositoriesRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe chiamare apiGet senza query se searchInput non è fornito', async () => {
    vi.mocked(apiGet).mockResolvedValue(mockRepos)
    const result = await getRepositoriesRepository.getRepositories('ws-1')
    expect(apiGet).toHaveBeenCalledWith('/api/workspaces/ws-1/repositories')
    expect(result).toEqual(mockRepos)
  })

  it('dovrebbe aggiungere il query param searchInput se fornito', async () => {
    vi.mocked(apiGet).mockResolvedValue([mockRepos[0]])
    await getRepositoriesRepository.getRepositories('ws-1', 'repo-a')
    expect(apiGet).toHaveBeenCalledWith(
      '/api/workspaces/ws-1/repositories?searchInput=repo-a',
    )
  })

  it('dovrebbe codificare correttamente searchInput con caratteri speciali', async () => {
    vi.mocked(apiGet).mockResolvedValue([])
    await getRepositoriesRepository.getRepositories('ws-1', 'my repo & more')
    expect(apiGet).toHaveBeenCalledWith(
      '/api/workspaces/ws-1/repositories?searchInput=my%20repo%20%26%20more',
    )
  })

  it('dovrebbe propagare gli errori della API', async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error('Non autorizzato'))
    await expect(
      getRepositoriesRepository.getRepositories('ws-1'),
    ).rejects.toThrow('Non autorizzato')
  })
})
