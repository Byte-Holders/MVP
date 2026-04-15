import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAddRepository } from './useAddRepository'
import type { ReactNode } from 'react'

vi.mock('../model/addRepositoryData', () => ({
  addRepositoryRepository: { addRepository: vi.fn() },
}))

import { addRepositoryRepository } from '../model/addRepositoryData'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAddRepository', () => {
  const workspaceId = 'ws-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe iniziare con isPending false', () => {
    const { result } = renderHook(() => useAddRepository(workspaceId), {
      wrapper: createWrapper(),
    })
    expect(result.current.isPending).toBe(false)
  })

  it('dovrebbe chiamare addRepository con i parametri corretti', async () => {
    vi.mocked(addRepositoryRepository.addRepository).mockResolvedValue(
      undefined,
    )
    const { result } = renderHook(() => useAddRepository(workspaceId), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.mutate({ repositoryUrl: 'https://github.com/org/repo' })
    })
    await waitFor(() => {
      expect(addRepositoryRepository.addRepository).toHaveBeenCalledWith(
        workspaceId,
        { repositoryUrl: 'https://github.com/org/repo' },
      )
    })
  })

  it('dovrebbe impostare isPending true durante la mutazione', async () => {
    vi.mocked(addRepositoryRepository.addRepository).mockReturnValue(
      new Promise(() => {}),
    )
    const { result } = renderHook(() => useAddRepository(workspaceId), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.mutate({ repositoryUrl: 'https://github.com/org/repo' })
    })
    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })
  })

  it('dovrebbe esporre isError in caso di fallimento', async () => {
    vi.mocked(addRepositoryRepository.addRepository).mockRejectedValue(
      new Error('Errore aggiunta'),
    )
    const { result } = renderHook(() => useAddRepository(workspaceId), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.mutate({ repositoryUrl: 'https://github.com/org/repo' })
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
