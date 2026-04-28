import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInviteMember } from './useInviteMember'
import type { ReactNode } from 'react'

vi.mock('../model/inviteMemberData', () => ({
  inviteMemberRepository: { inviteMember: vi.fn() },
}))

import { inviteMemberRepository } from '../model/inviteMemberData'

const mockInvalidateQueries = vi.fn()

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  }
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useInviteMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- stato iniziale ---

  it('si inizializza con username = "" e il primo ruolo disponibile', () => {
    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.username).toBe('')
    // il primo ruolo è quello di default dell'enum WORKSPACE_ROLES[0]
    expect(result.current.role).toBeDefined()
    expect(result.current.isPending).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('aggiorna username tramite setUsername', () => {
    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setUsername('mario_rossi')
    })

    expect(result.current.username).toBe('mario_rossi')
  })

  it('aggiorna role tramite setRole', () => {
    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setRole('Tech Lead' as any)
    })

    expect(result.current.role).toBe('Tech Lead')
  })

  // --- handleSubmit: protezione username vuoto ---

  it('non chiama inviteMember se username è vuoto (stringa vuota)', () => {
    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as any)
    })

    expect(inviteMemberRepository.inviteMember).not.toHaveBeenCalled()
  })

  it('non chiama inviteMember se username è solo spazi bianchi', () => {
    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setUsername('   ')
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    expect(inviteMemberRepository.inviteMember).not.toHaveBeenCalled()
  })

  // --- handleSubmit: caso nominale ---

  it('chiama inviteMember con workspaceId, username e role corretti', async () => {
    vi.mocked(inviteMemberRepository.inviteMember).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setUsername('mario_rossi')
      result.current.setRole('Developer' as any)
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    await waitFor(() => {
      expect(inviteMemberRepository.inviteMember).toHaveBeenCalledWith(
        'ws-1',
        'mario_rossi',
        'Developer',
      )
    })
  })

  // --- onSuccess: reset stato e invalidazione cache ---

  it('azzera username e ripristina il ruolo di default dopo il successo', async () => {
    vi.mocked(inviteMemberRepository.inviteMember).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setUsername('mario_rossi')
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    await waitFor(() => {
      expect(result.current.username).toBe('')
    })
    // il ruolo torna al primo elemento di WORKSPACE_ROLES
    expect(result.current.role).toBeDefined()
  })

  it('chiama invalidateQueries con la chiave ["members", workspaceId] dopo il successo', async () => {
    vi.mocked(inviteMemberRepository.inviteMember).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setUsername('mario_rossi')
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['members', 'ws-1'],
      })
    })
  })

  it("espone isSuccess = true dopo l'invio con successo", async () => {
    vi.mocked(inviteMemberRepository.inviteMember).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setUsername('mario_rossi')
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  // --- gestione errori ---

  it('espone error non null se inviteMember fallisce (utente non trovato)', async () => {
    vi.mocked(inviteMemberRepository.inviteMember).mockRejectedValue(
      new Error('Utente non trovato'),
    )

    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setUsername('ghost_user')
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.message).toBe('Utente non trovato')
    })
  })

  it('non chiama invalidateQueries se inviteMember fallisce', async () => {
    vi.mocked(inviteMemberRepository.inviteMember).mockRejectedValue(
      new Error('Invito già pendente'),
    )

    const { result } = renderHook(() => useInviteMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setUsername('mario_rossi')
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(mockInvalidateQueries).not.toHaveBeenCalled()
  })
})
