import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetReport } from './useGetReport'
import type { ReactNode } from 'react'

vi.mock('../model/getReportData', () => ({
  getReportRepository: { getReport: vi.fn() },
}))

import { getReportRepository } from '../model/getReportData'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockReport = {
  data: {
    depsReport: { vulnerabilities: [], vulnerabilityAnalysis: '' },
    vulnerabilitiesReport: { vulnerabilities: [], mark: 8 },
    docsReport: { readmeReport: 'ok', commentReport: 'ok', mark: 7 },
    testReport: {
      coverageReport: {
        statements: 80,
        branches: 70,
        functions: 90,
        lines: 80,
      },
      failedTests: [],
      testsRun: 10,
    },
    techReport: { libraries: [], frameworks: [], languages: [] },
  },
}

describe('useGetReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe restituire il report', async () => {
    vi.mocked(getReportRepository.getReport).mockResolvedValue(mockReport)
    const { result } = renderHook(() => useGetReport('repo-1', 'develop'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.data).toEqual(mockReport)
    })
    expect(getReportRepository.getReport).toHaveBeenCalledWith(
      'repo-1',
      'develop',
    )
  })

  it('dovrebbe essere disabilitato se branch è undefined', () => {
    const { result } = renderHook(() => useGetReport('repo-1', undefined), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('dovrebbe restituire isLoading true inizialmente', () => {
    vi.mocked(getReportRepository.getReport).mockReturnValue(
      new Promise(() => {}),
    )
    const { result } = renderHook(() => useGetReport('repo-1', 'main'), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })
})
