import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useScan, useStopScan } from './useScan'
import type { ReactNode } from 'react'

vi.mock('../model/scan', () => ({
  scanRepository: {
    requestScan: vi.fn(),
    stopScan: vi.fn(),
  },
}))

import { scanRepository } from '../model/scan'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useScan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe iniziare con isPending false e scanId undefined', () => {
    const { result } = renderHook(
      () =>
        useScan({
          workspaceId: 'ws-1',
          repositoryId: 'repo-1',
          branch: 'main',
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current.isPending).toBe(false)
    expect(result.current.scanId).toBeUndefined()
    expect(result.current.isSuccess).toBe(false)
  })

  it('dovrebbe impostare isPending true durante la mutazione', async () => {
    vi.mocked(scanRepository.requestScan).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(
      () =>
        useScan({
          workspaceId: 'ws-1',
          repositoryId: 'repo-1',
          branch: 'main',
        }),
      { wrapper: createWrapper() },
    )
    act(() => {
      result.current.triggerScan()
    })
    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })
  })

  it('dovrebbe restituire scanId dopo il successo', async () => {
    vi.mocked(scanRepository.requestScan).mockResolvedValue('scan-123')
    const { result } = renderHook(
      () =>
        useScan({
          workspaceId: 'ws-1',
          repositoryId: 'repo-1',
          branch: 'main',
        }),
      { wrapper: createWrapper() },
    )
    act(() => {
      result.current.triggerScan()
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.scanId).toBe('scan-123')
  })

  it('dovrebbe impostare error in caso di fallimento', async () => {
    vi.mocked(scanRepository.requestScan).mockRejectedValue(
      new Error('Scan fallito'),
    )
    const { result } = renderHook(
      () =>
        useScan({
          workspaceId: 'ws-1',
          repositoryId: 'repo-1',
          branch: 'main',
        }),
      { wrapper: createWrapper() },
    )
    act(() => {
      result.current.triggerScan()
    })
    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })
    expect(result.current.error?.message).toBe('Scan fallito')
  })
})

describe('useStopScan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe iniziare con isStopping false', () => {
    const { result } = renderHook(() => useStopScan(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isStopping).toBe(false)
    expect(result.current.stopError).toBeNull()
  })

  it('dovrebbe chiamare stopScan con il scanId corretto', async () => {
    vi.mocked(scanRepository.stopScan).mockResolvedValue(undefined)
    const { result } = renderHook(() => useStopScan(), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.triggerStop('scan-abc')
    })
    await waitFor(() => {
      expect(scanRepository.stopScan).toHaveBeenCalledWith('scan-abc')
    })
  })

  it('dovrebbe impostare isStopping true durante la mutazione', async () => {
    vi.mocked(scanRepository.stopScan).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useStopScan(), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.triggerStop('scan-abc')
    })
    await waitFor(() => {
      expect(result.current.isStopping).toBe(true)
    })
  })
})
