import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inviteMemberRepository } from './inviteMemberData'

vi.mock('../../../api/apiClient', () => ({
  apiPost: vi.fn(),
}))

import { apiPost } from '../../../api/apiClient'

describe('inviteMemberRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chiama POST /api/invitations con workspaceId, recipientUsername e recipientRole', async () => {
    vi.mocked(apiPost).mockResolvedValue(undefined)

    await inviteMemberRepository.inviteMember(
      'ws-1',
      'mario_rossi',
      'Developer',
    )

    expect(apiPost).toHaveBeenCalledWith('/api/invitations', {
      workspaceId: 'ws-1',
      recipientUsername: 'mario_rossi',
      recipientRole: 'Developer',
    })
  })

  it('funziona correttamente con il ruolo Tech Lead', async () => {
    vi.mocked(apiPost).mockResolvedValue(undefined)

    await inviteMemberRepository.inviteMember('ws-2', 'alice_dev', 'Tech Lead')

    expect(apiPost).toHaveBeenCalledWith('/api/invitations', {
      workspaceId: 'ws-2',
      recipientUsername: 'alice_dev',
      recipientRole: 'Tech Lead',
    })
  })

  it('funziona correttamente con il ruolo Project Manager', async () => {
    vi.mocked(apiPost).mockResolvedValue(undefined)

    await inviteMemberRepository.inviteMember(
      'ws-3',
      'bob_pm',
      'Project Manager',
    )

    expect(apiPost).toHaveBeenCalledWith('/api/invitations', {
      workspaceId: 'ws-3',
      recipientUsername: 'bob_pm',
      recipientRole: 'Project Manager',
    })
  })

  it('propaga gli errori 404 (destinatario non trovato nel sistema)', async () => {
    vi.mocked(apiPost).mockRejectedValue(new Error('Utente non trovato'))

    await expect(
      inviteMemberRepository.inviteMember('ws-1', 'ghost_user', 'Developer'),
    ).rejects.toThrow('Utente non trovato')
  })

  it('propaga gli errori 400 (utente già membro o invito già pendente)', async () => {
    vi.mocked(apiPost).mockRejectedValue(
      new Error('Invito già pendente per questo utente'),
    )

    await expect(
      inviteMemberRepository.inviteMember('ws-1', 'mario_rossi', 'Developer'),
    ).rejects.toThrow('Invito già pendente per questo utente')
  })
})
