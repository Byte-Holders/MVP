import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetRepositories } from './useGetRepositories'
import { getRepositoriesData } from '../model/getRepositoriesData'
import type { ReactNode } from 'react'

vi.mock('../model/getRepositoriesData', () => ({
  getRepositoriesData: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useGetRepositories Hook', () => {
  const workspaceId = 'ws-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe restituire i repository dalla API', async () => {
    const mockRepos = [
      { repositoryId: 'r-1', name: 'repo-a', ownerName: 'alice' },
    ]
    vi.mocked(getRepositoriesData).mockResolvedValue(mockRepos)
    const { result } = renderHook(() => useGetRepositories(workspaceId), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.data).toEqual(mockRepos)
    })
  })

  it('dovrebbe passare searchInput alla API', async () => {
    vi.mocked(getRepositoriesData).mockResolvedValue([])
    const { result } = renderHook(
      () => useGetRepositories(workspaceId, 'mio-repo'),
      { wrapper: createWrapper() },
    )
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(getRepositoriesData).toHaveBeenCalledWith(workspaceId, 'mio-repo')
  })

  it('dovrebbe essere disabilitato se workspaceId è vuoto', () => {
    const { result } = renderHook(() => useGetRepositories(''), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('dovrebbe restituire una lista vuota se non ci sono repository', async () => {
    vi.mocked(getRepositoriesData).mockResolvedValue([])
    const { result } = renderHook(() => useGetRepositories(workspaceId), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })
})
