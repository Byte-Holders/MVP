import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRemoveRepository } from './useRemoveRepository'
import { removeRepositoryData } from '../model/removeRepositoryData'
import type { ReactNode } from 'react'

vi.mock('../model/removeRepositoryData', () => ({
  removeRepositoryData: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useRemoveRepository Hook', () => {
  const workspaceId = 'ws-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe chiamare removeRepositoryData con i parametri corretti', async () => {
    vi.mocked(removeRepositoryData).mockResolvedValue(undefined)
    const { result } = renderHook(() => useRemoveRepository(workspaceId), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate({ repositoryId: 'repo-1' })
    })

    await vi.waitFor(() => {
      expect(removeRepositoryData).toHaveBeenCalledWith(workspaceId, 'repo-1')
    })
  })

  it('dovrebbe impostare isPending a true durante la mutazione', async () => {
    vi.mocked(removeRepositoryData).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useRemoveRepository(workspaceId), {
      wrapper: createWrapper(),
    })

    expect(result.current.isPending).toBe(false)

    act(() => {
      result.current.mutate({ repositoryId: 'repo-2' })
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })
  })

  it('dovrebbe iniziare con isPending a false', () => {
    const { result } = renderHook(() => useRemoveRepository(workspaceId), {
      wrapper: createWrapper(),
    })
    expect(result.current.isPending).toBe(false)
  })
})
