import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetBranches } from './useGetBranches'
import type { ReactNode } from 'react'

vi.mock('../model/getBranchesData', () => ({
  getBranchesRepository: { getBranches: vi.fn() },
}))

import { getBranchesRepository } from '../model/getBranchesData'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useGetBranches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe restituire la lista di branch', async () => {
    vi.mocked(getBranchesRepository.getBranches).mockResolvedValue(['main', 'develop'])
    const { result } = renderHook(() => useGetBranches('repo-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.data).toEqual(['main', 'develop'])
    })
  })

  it('dovrebbe essere disabilitato se repositoryId è vuoto', () => {
    const { result } = renderHook(() => useGetBranches(''), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('dovrebbe restituire isLoading true inizialmente', () => {
    vi.mocked(getBranchesRepository.getBranches).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useGetBranches('repo-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })
})
