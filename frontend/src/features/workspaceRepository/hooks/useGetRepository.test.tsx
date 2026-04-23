import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetRepository } from './useGetRepository'
import type { ReactNode } from 'react'

vi.mock('../model/getRepositoryData', () => ({
  getRepositoryRepository: { getRepository: vi.fn() },
}))

import { getRepositoryRepository } from '../model/getRepositoryData'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockRepo = {
  repositoryId: 'repo-1',
  name: 'my-repo',
  ownerName: 'alice',
}

describe('useGetRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe restituire il repository corretto', async () => {
    vi.mocked(getRepositoryRepository.getRepository).mockResolvedValue(mockRepo)
    const { result } = renderHook(() => useGetRepository('repo-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.data).toEqual(mockRepo)
    })
  })

  it('dovrebbe chiamare getRepository con il repositoryId corretto', async () => {
    vi.mocked(getRepositoryRepository.getRepository).mockResolvedValue(mockRepo)
    renderHook(() => useGetRepository('repo-1'), { wrapper: createWrapper() })
    await waitFor(() => {
      expect(getRepositoryRepository.getRepository).toHaveBeenCalledWith(
        'repo-1',
      )
    })
  })

  it('dovrebbe essere disabilitato se repositoryId è vuoto', () => {
    const { result } = renderHook(() => useGetRepository(''), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('dovrebbe restituire isLoading true inizialmente', () => {
    vi.mocked(getRepositoryRepository.getRepository).mockReturnValue(
      new Promise(() => {}),
    )
    const { result } = renderHook(() => useGetRepository('repo-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })
})
