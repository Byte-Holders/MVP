import { describe, it, expect, vi, beforeEach } from 'vitest'
import { removeMemberRepository } from './removeMemberData'

vi.mock('../../../api/apiClient', () => ({
  apiDelete: vi.fn(),
}))

import { apiDelete } from '../../../api/apiClient'

describe('removeMemberRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chiama DELETE /api/workspaces/:wId/users/:userId con i parametri corretti', async () => {
    vi.mocked(apiDelete).mockResolvedValue(undefined)

    await removeMemberRepository.removeMember('ws-1', 'user-1')

    expect(apiDelete).toHaveBeenCalledWith('/api/workspaces/ws-1/users/user-1')
  })

  it('costruisce il path corretto per workspace e userId diversi', async () => {
    vi.mocked(apiDelete).mockResolvedValue(undefined)

    await removeMemberRepository.removeMember('ws-abc', 'user-xyz')

    expect(apiDelete).toHaveBeenCalledWith(
      '/api/workspaces/ws-abc/users/user-xyz',
    )
  })

  it('propaga gli errori 403 (utente non autorizzato a rimuovere)', async () => {
    vi.mocked(apiDelete).mockRejectedValue(new Error('Accesso negato'))

    await expect(
      removeMemberRepository.removeMember('ws-1', 'user-1'),
    ).rejects.toThrow('Accesso negato')
  })

  it('propaga gli errori 404 (membro non trovato nel workspace)', async () => {
    vi.mocked(apiDelete).mockRejectedValue(new Error('Membro non trovato'))

    await expect(
      removeMemberRepository.removeMember('ws-1', 'user-inesistente'),
    ).rejects.toThrow('Membro non trovato')
  })
})
