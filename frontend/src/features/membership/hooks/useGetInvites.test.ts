import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useGetInvites } from './useGetInvites'

vi.mock('../model/getInvitesData', () => ({
  getInvitesRepository: { getInvites: vi.fn() },
}))

import { getInvitesRepository } from '../model/getInvitesData'

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children)
}

describe('useGetInvites', () => {
  beforeEach(() => vi.clearAllMocks())

  it('restituisce gli inviti quando la query ha successo', async () => {
    const invites = [
      {
        _id: 'inv-1',
        workspaceName: 'WS',
        senderUsername: 'alice',
        recipientUsername: 'bob',
        recipientRole: 'developer',
        status: 'PENDING' as const,
      },
    ]
    vi.mocked(getInvitesRepository.getInvites).mockResolvedValue(invites)

    const { result } = renderHook(() => useGetInvites(), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(invites)
  })

  it('restituisce isError se la query fallisce', async () => {
    vi.mocked(getInvitesRepository.getInvites).mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useGetInvites(), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
