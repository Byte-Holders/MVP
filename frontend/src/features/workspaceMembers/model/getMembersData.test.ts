import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMembersRepository } from './getMembersData'

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(),
}))

import { apiGet } from '../../../api/apiClient'

const mockMembers = [
  { userId: 'user-1', username: 'mario_rossi', role: 'Developer' },
  { userId: 'user-2', username: 'alice_dev', role: 'Tech Lead' },
]

describe('getMembersRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chiama GET /api/workspaces/:id/users e restituisce i membri', async () => {
    vi.mocked(apiGet).mockResolvedValue(mockMembers)

    const result = await getMembersRepository.getMembers('ws-1')

    expect(apiGet).toHaveBeenCalledWith('/api/workspaces/ws-1/users')
    expect(result).toEqual(mockMembers)
  })

  it('restituisce un array vuoto se il workspace non ha membri', async () => {
    vi.mocked(apiGet).mockResolvedValue([])

    const result = await getMembersRepository.getMembers('ws-empty')

    expect(apiGet).toHaveBeenCalledWith('/api/workspaces/ws-empty/users')
    expect(result).toEqual([])
  })

  it('propaga gli errori della API (es. 401 non autorizzato)', async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error('Non autorizzato'))

    await expect(getMembersRepository.getMembers('ws-1')).rejects.toThrow(
      'Non autorizzato',
    )
  })

  it('propaga gli errori 404 se il workspace non esiste', async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error('Workspace non trovato'))

    await expect(
      getMembersRepository.getMembers('ws-inesistente'),
    ).rejects.toThrow('Workspace non trovato')
  })
})
