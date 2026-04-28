import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRemoveMember } from './useRemoveMember'
import type { ReactNode } from 'react'

vi.mock('../model/removeMemberData', () => ({
  removeMemberRepository: { removeMember: vi.fn() },
}))

import { removeMemberRepository } from '../model/removeMemberData'

// Spy su invalidateQueries per verificare l'invalidazione della cache
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

describe('useRemoveMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parte con isPending = false', () => {
    const { result } = renderHook(() => useRemoveMember('ws-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isPending).toBe(false)
  })

  it('chiama removeMember con workspaceId e userId corretti al trigger della mutazione', async () => {
    vi.mocked(removeMemberRepository.removeMember).mockResolvedValue(undefined)

    const { result } = renderHook(() => useRemoveMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate('user-1')
    })

    await waitFor(() => {
      expect(removeMemberRepository.removeMember).toHaveBeenCalledWith(
        'ws-1',
        'user-1',
      )
    })
  })

  it('imposta isPending = true durante la mutazione in corso', async () => {
    vi.mocked(removeMemberRepository.removeMember).mockReturnValue(
      new Promise(() => {}),
    )

    const { result } = renderHook(() => useRemoveMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate('user-2')
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })
  })

  it('chiama invalidateQueries con la chiave ["members", workspaceId] dopo la rimozione con successo', async () => {
    vi.mocked(removeMemberRepository.removeMember).mockResolvedValue(undefined)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { result } = renderHook(() => useRemoveMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate('user-1')
    })

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['members', 'ws-1'],
      })
    })
  })

  it('non chiama invalidateQueries se removeMember fallisce', async () => {
    vi.mocked(removeMemberRepository.removeMember).mockRejectedValue(
      new Error('Accesso negato'),
    )

    const { result } = renderHook(() => useRemoveMember('ws-1'), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate('user-1')
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(mockInvalidateQueries).not.toHaveBeenCalled()
  })
})
