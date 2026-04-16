import { describe, it, expect, vi, beforeEach } from 'vitest'
import { manageInviteRepository } from './manageInviteData'

vi.mock('../../../api/apiClient', () => ({ apiPatch: vi.fn() }))

import { apiPatch } from '../../../api/apiClient'

describe('manageInviteRepository', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chiama PATCH /api/invitations/:id con action Accept', async () => {
    vi.mocked(apiPatch).mockResolvedValue(undefined)
    await manageInviteRepository.manageInvite('inv-1', 'Accept')
    expect(apiPatch).toHaveBeenCalledWith('/api/invitations/inv-1', { action: 'Accept' })
  })

  it('chiama PATCH /api/invitations/:id con action Reject', async () => {
    vi.mocked(apiPatch).mockResolvedValue(undefined)
    await manageInviteRepository.manageInvite('inv-2', 'Reject')
    expect(apiPatch).toHaveBeenCalledWith('/api/invitations/inv-2', { action: 'Reject' })
  })

  it('propaga l\'errore se apiPatch fallisce', async () => {
    vi.mocked(apiPatch).mockRejectedValue(new Error('Server error'))
    await expect(manageInviteRepository.manageInvite('inv-1', 'Accept')).rejects.toThrow('Server error')
  })
})
