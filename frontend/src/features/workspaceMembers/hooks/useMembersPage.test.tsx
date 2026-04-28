import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMembersPage } from './useMembersPage'
import type { ReactNode } from 'react'

// Mocka i tre hook interni usati da useMembersPage
vi.mock('./useGetMembers', () => ({
  useGetMembers: vi.fn(),
}))
vi.mock('./useRemoveMember', () => ({
  useRemoveMember: vi.fn(),
}))
vi.mock('./useInviteMember', () => ({
  useInviteMember: vi.fn(),
}))

import { useGetMembers } from './useGetMembers'
import { useRemoveMember } from './useRemoveMember'
import { useInviteMember } from './useInviteMember'

const mockMembers = [
  { userId: 'user-1', username: 'mario_rossi', role: 'Developer' },
]

const mockInviteForm = {
  username: '',
  setUsername: vi.fn(),
  role: 'Developer',
  setRole: vi.fn(),
  isPending: false,
  error: null,
  isSuccess: false,
  handleSubmit: vi.fn(),
}

const createWrapper = () => {
  const queryClient = new QueryClient()
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useMembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useGetMembers).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    } as any)

    vi.mocked(useRemoveMember).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(useInviteMember).mockReturnValue(mockInviteForm as any)
  })

  it('espone members, membersLoading, removeMember, isRemoving e inviteForm', () => {
    const { result } = renderHook(() => useMembersPage('ws-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.members).toEqual(mockMembers)
    expect(result.current.membersLoading).toBe(false)
    expect(result.current.removeMember).toBeDefined()
    expect(result.current.isRemoving).toBe(false)
    expect(result.current.inviteForm).toEqual(mockInviteForm)
  })

  it('passa workspaceId a useGetMembers, useRemoveMember e useInviteMember', () => {
    renderHook(() => useMembersPage('ws-abc'), {
      wrapper: createWrapper(),
    })

    expect(useGetMembers).toHaveBeenCalledWith('ws-abc')
    expect(useRemoveMember).toHaveBeenCalledWith('ws-abc')
    expect(useInviteMember).toHaveBeenCalledWith('ws-abc')
  })

  it('restituisce members = [] se useGetMembers non ha ancora dati (default fallback)', () => {
    vi.mocked(useGetMembers).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)

    const { result } = renderHook(() => useMembersPage('ws-1'), {
      wrapper: createWrapper(),
    })

    // Il destructuring usa `data: members = []` quindi il default è array vuoto
    expect(result.current.members).toEqual([])
    expect(result.current.membersLoading).toBe(true)
  })

  it('riflette isRemoving = true quando useRemoveMember è in pending', () => {
    vi.mocked(useRemoveMember).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any)

    const { result } = renderHook(() => useMembersPage('ws-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isRemoving).toBe(true)
  })

  it('espone la funzione removeMember proveniente da useRemoveMember', () => {
    const mockMutate = vi.fn()
    vi.mocked(useRemoveMember).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)

    const { result } = renderHook(() => useMembersPage('ws-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.removeMember).toBe(mockMutate)
  })
})
