import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useManageInvite } from './useManageInvite'

vi.mock('../model/manageInviteData', () => ({
  manageInviteRepository: { manageInvite: vi.fn() },
}))

import { manageInviteRepository } from '../model/manageInviteData'

const makeWrapper = () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children)
}

describe('useManageInvite', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chiama manageInvite con i parametri corretti', async () => {
    vi.mocked(manageInviteRepository.manageInvite).mockResolvedValue(undefined)

    const { result } = renderHook(() => useManageInvite(), { wrapper: makeWrapper() })

    act(() => {
      result.current.mutate({ membershipId: 'inv-1', action: 'Accept' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(manageInviteRepository.manageInvite).toHaveBeenCalledWith('inv-1', 'Accept')
  })

  it('espone isError se la mutation fallisce', async () => {
    vi.mocked(manageInviteRepository.manageInvite).mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useManageInvite(), { wrapper: makeWrapper() })

    act(() => {
      result.current.mutate({ membershipId: 'inv-1', action: 'Reject' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
