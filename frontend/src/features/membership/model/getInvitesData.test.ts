import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getInvitesRepository } from './getInvitesData'

vi.mock('../../../api/apiClient', () => ({ apiGet: vi.fn() }))

import { apiGet } from '../../../api/apiClient'

const mockInvites = [
  {
    _id: 'inv-1',
    workspaceName: 'MyWS',
    senderUsername: 'alice',
    recipientUsername: 'bob',
    recipientRole: 'developer',
    status: 'PENDING' as const,
  },
]

describe('getInvitesRepository', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chiama GET /api/invitations e restituisce gli inviti', async () => {
    vi.mocked(apiGet).mockResolvedValue(mockInvites)
    const result = await getInvitesRepository.getInvites()
    expect(apiGet).toHaveBeenCalledWith('/api/invitations')
    expect(result).toEqual(mockInvites)
  })

  it('propaga l\'errore se apiGet fallisce', async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error('Network error'))
    await expect(getInvitesRepository.getInvites()).rejects.toThrow('Network error')
  })
})
