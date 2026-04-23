import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAddRepositoryForm } from './useAddRepositoryForm'
import type { ReactNode } from 'react'

vi.mock('../model/addRepositoryData', () => ({
  addRepositoryRepository: { addRepository: vi.fn() },
}))

import { addRepositoryRepository } from '../model/addRepositoryData'

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
)

describe('useAddRepositoryForm Hook', () => {
  const workspaceId = 'workspace-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe inizializzare lo stato correttamente', () => {
    const { result } = renderHook(() => useAddRepositoryForm(workspaceId), {
      wrapper,
    })
    expect(result.current.url).toBe('')
    expect(result.current.token).toBe('')
  })

  it('non dovrebbe chiamare mutate se url è vuoto', () => {
    const { result } = renderHook(() => useAddRepositoryForm(workspaceId), {
      wrapper,
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(addRepositoryRepository.addRepository).not.toHaveBeenCalled()
  })
})
