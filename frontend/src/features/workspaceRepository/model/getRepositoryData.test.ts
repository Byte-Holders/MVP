import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRepositoryRepository } from './getRepositoryData'

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(),
}))

import { apiGet } from '../../../api/apiClient'

describe('getRepositoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe chiamare apiGet con il percorso corretto', async () => {
    const mockRepo = { repositoryId: 'repo-1', name: 'my-repo', ownerName: 'alice' }
    vi.mocked(apiGet).mockResolvedValue(mockRepo)
    const result = await getRepositoryRepository.getRepository('repo-1')
    expect(apiGet).toHaveBeenCalledWith('/api/repositories/repo-1')
    expect(result).toEqual(mockRepo)
  })

  it('dovrebbe propagare gli errori della API', async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error('Non trovato'))
    await expect(getRepositoryRepository.getRepository('repo-x')).rejects.toThrow('Non trovato')
  })
})
