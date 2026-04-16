import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInvitePage } from './useInvitePage'

vi.mock('./useGetInvites', () => ({ useGetInvites: vi.fn() }))
vi.mock('./useManageInvite', () => ({ useManageInvite: vi.fn() }))

import { useGetInvites } from './useGetInvites'
import { useManageInvite } from './useManageInvite'

const invite = {
  _id: 'inv-1',
  workspaceName: 'WS',
  senderUsername: 'alice',
  recipientUsername: 'bob',
  recipientRole: 'developer',
  status: 'PENDING' as const,
}

describe('useInvitePage', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useGetInvites).mockReturnValue({
      data: [invite],
      isLoading: false,
    } as any)
    vi.mocked(useManageInvite).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)
  })

  it('espone gli inviti e lo stato di caricamento', () => {
    const { result } = renderHook(() => useInvitePage())
    expect(result.current.invites).toEqual([invite])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isPending).toBe(false)
  })

  it('handleAction chiama mutate con membershipId e action', () => {
    const { result } = renderHook(() => useInvitePage())
    act(() => {
      result.current.handleAction('inv-1', 'Accept')
    })
    expect(mockMutate).toHaveBeenCalledWith({
      membershipId: 'inv-1',
      action: 'Accept',
    })
  })

  it('restituisce array vuoto se data è undefined', () => {
    vi.mocked(useGetInvites).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    const { result } = renderHook(() => useInvitePage())
    expect(result.current.invites).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
