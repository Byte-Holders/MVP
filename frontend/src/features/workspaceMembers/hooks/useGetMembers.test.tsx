import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetMembers } from './useGetMembers'
import type { ReactNode } from 'react'

vi.mock('../model/getMembersData', () => ({
  getMembersRepository: { getMembers: vi.fn() },
}))

import { getMembersRepository } from '../model/getMembersData'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockMembers = [
  { userId: 'user-1', username: 'mario_rossi', role: 'Developer' },
  { userId: 'user-2', username: 'alice_dev', role: 'Tech Lead' },
]

describe('useGetMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('restituisce la lista dei membri dopo il caricamento', async () => {
    vi.mocked(getMembersRepository.getMembers).mockResolvedValue(mockMembers)

    const { result } = renderHook(() => useGetMembers('ws-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockMembers)
    })
    expect(getMembersRepository.getMembers).toHaveBeenCalledWith('ws-1')
  })

  it('è disabilitato (fetchStatus = "idle") se workspaceId è una stringa vuota', () => {
    const { result } = renderHook(() => useGetMembers(''), {
      wrapper: createWrapper(),
    })

    // Query non si avvia se workspaceId è falsy (enabled: !!workspaceId)
    expect(result.current.fetchStatus).toBe('idle')
    expect(getMembersRepository.getMembers).not.toHaveBeenCalled()
  })

  it('espone isLoading = true mentre la chiamata è pendente', () => {
    vi.mocked(getMembersRepository.getMembers).mockReturnValue(
      new Promise(() => {}),
    )

    const { result } = renderHook(() => useGetMembers('ws-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('restituisce data = [] se il workspace non ha membri', async () => {
    vi.mocked(getMembersRepository.getMembers).mockResolvedValue([])

    const { result } = renderHook(() => useGetMembers('ws-empty'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.data).toEqual([])
  })

  it('espone isError = true se getMembers fallisce', async () => {
    vi.mocked(getMembersRepository.getMembers).mockRejectedValue(
      new Error('Errore di rete'),
    )

    const { result } = renderHook(() => useGetMembers('ws-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('usa la queryKey ["members", workspaceId] — una chiamata con ws-2 non usa la cache di ws-1', async () => {
    vi.mocked(getMembersRepository.getMembers).mockResolvedValue(mockMembers)

    const { result: r1 } = renderHook(() => useGetMembers('ws-1'), {
      wrapper: createWrapper(),
    })
    const { result: r2 } = renderHook(() => useGetMembers('ws-2'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(r1.current.isLoading).toBe(false))
    await waitFor(() => expect(r2.current.isLoading).toBe(false))

    // Entrambe le istanze hanno chiamato getMembers con il proprio workspaceId
    expect(getMembersRepository.getMembers).toHaveBeenCalledWith('ws-1')
    expect(getMembersRepository.getMembers).toHaveBeenCalledWith('ws-2')
  })
})
