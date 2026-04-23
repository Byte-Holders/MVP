import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetWorkspace } from './useGetWorkspace'
import type { ReactNode } from 'react'

vi.mock('../model/getWorkspacesApi', () => ({
  workspaceListRepository: {
    getWorkspaces: vi.fn(),
  },
}))

import { workspaceListRepository } from '../model/getWorkspacesApi'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockWorkspaces = [
  { id: 'ws-1', name: 'Alpha', owner: 'alice', role: 'owner' },
  { id: 'ws-2', name: 'Beta', owner: 'bob', role: 'member' },
]

describe('useGetWorkspace Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe restituire il workspace corretto tramite id', async () => {
    vi.mocked(workspaceListRepository.getWorkspaces).mockResolvedValue(
      mockWorkspaces,
    )
    const { result } = renderHook(() => useGetWorkspace('ws-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.data).toEqual(mockWorkspaces[0])
    })
  })

  it('dovrebbe restituire undefined per un id inesistente', async () => {
    vi.mocked(workspaceListRepository.getWorkspaces).mockResolvedValue(
      mockWorkspaces,
    )
    const { result } = renderHook(() => useGetWorkspace('non-esiste'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.data).toBeUndefined()
  })

  it('dovrebbe restituire isLoading true inizialmente', () => {
    vi.mocked(workspaceListRepository.getWorkspaces).mockReturnValue(
      new Promise(() => {}),
    )
    const { result } = renderHook(() => useGetWorkspace('ws-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })
})
