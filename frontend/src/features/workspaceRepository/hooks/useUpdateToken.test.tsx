import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateToken } from './useUpdateToken'
import type { ReactNode } from 'react'

vi.mock('../model/updateTokenData', () => ({
  updateTokenRepository: { updateToken: vi.fn() },
}))

import { updateTokenRepository } from '../model/updateTokenData'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useUpdateToken Hook', () => {
  const workspaceId = 'myWorkspaceId'
  const repositoryId = 'myRepositoryId'
  const validToken = 'ghp_' + 'a'.repeat(36)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets clientError if the token is malformed', () => {
    const { result } = renderHook(
      () => useUpdateToken(workspaceId, repositoryId),
      { wrapper: createWrapper() },
    )

    act(() => {
      result.current.setToken('myInvalidToken')
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    expect(result.current.clientError).not.toBe(null)
    expect(updateTokenRepository.updateToken).not.toHaveBeenCalled()
  })

  it(' the token once submitted', async () => {
    vi.mocked(updateTokenRepository.updateToken).mockResolvedValue(undefined)
    const { result } = renderHook(
      () => useUpdateToken(workspaceId, repositoryId),
      { wrapper: createWrapper() },
    )

    act(() => {
      result.current.setToken(validToken)
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    await waitFor(() => {
      expect(result.current.token).toBe('')
    })
    expect(updateTokenRepository.updateToken).toHaveBeenCalledWith(
      workspaceId,
      repositoryId,
      validToken,
    )
  })

  it('espone serverError se la chiamata API fallisce', async () => {
    const errorMessage = 'myErrorMessage'

    vi.mocked(updateTokenRepository.updateToken).mockRejectedValue(
      new Error(errorMessage),
    )
    const { result } = renderHook(
      () => useUpdateToken(workspaceId, repositoryId),
      { wrapper: createWrapper() },
    )

    act(() => {
      result.current.setToken(validToken)
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })

    await waitFor(() => {
      expect(result.current.serverError?.message).toBe(errorMessage)
    })
  })
})
