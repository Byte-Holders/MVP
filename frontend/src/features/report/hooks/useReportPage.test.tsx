import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReportPage } from './useReportPage'
import type { ReactNode } from 'react'

vi.mock('../model/getBranchesData', () => ({
  getBranchesRepository: { getBranches: vi.fn() },
}))

vi.mock('../model/getReportData', () => ({
  getReportRepository: { getReport: vi.fn() },
}))

import { getBranchesRepository } from '../model/getBranchesData'
import { getReportRepository } from '../model/getReportData'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getReportRepository.getReport).mockReturnValue(new Promise(() => {}))
  })

  it('dovrebbe iniziare con selectedBranch undefined', () => {
    vi.mocked(getBranchesRepository.getBranches).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useReportPage('repo-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.selectedBranch).toBeUndefined()
    expect(result.current.branchesLoading).toBe(true)
  })

  it('dovrebbe selezionare develop automaticamente se presente', async () => {
    vi.mocked(getBranchesRepository.getBranches).mockResolvedValue(['main', 'develop', 'feature/x'])
    const { result } = renderHook(() => useReportPage('repo-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.selectedBranch).toBe('develop')
    })
  })

  it('dovrebbe selezionare il primo branch se develop non è presente', async () => {
    vi.mocked(getBranchesRepository.getBranches).mockResolvedValue(['main', 'feature/x'])
    const { result } = renderHook(() => useReportPage('repo-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.selectedBranch).toBe('main')
    })
  })

  it('dovrebbe permettere la selezione manuale di un branch', async () => {
    vi.mocked(getBranchesRepository.getBranches).mockResolvedValue(['main', 'develop'])
    const { result } = renderHook(() => useReportPage('repo-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.selectedBranch).toBe('develop')
    })
    act(() => {
      result.current.setSelectedBranch('main')
    })
    expect(result.current.selectedBranch).toBe('main')
  })

  it('non dovrebbe sovrascrivere la selezione manuale al ricaricamento dei branch', async () => {
    vi.mocked(getBranchesRepository.getBranches).mockResolvedValue(['main', 'develop'])
    const { result } = renderHook(() => useReportPage('repo-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.branches).toHaveLength(2)
    })
    act(() => {
      result.current.setSelectedBranch('main')
    })
    expect(result.current.selectedBranch).toBe('main')
  })

  it('dovrebbe esporre le branch caricate', async () => {
    const branches = ['main', 'develop']
    vi.mocked(getBranchesRepository.getBranches).mockResolvedValue(branches)
    const { result } = renderHook(() => useReportPage('repo-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.branches).toEqual(branches)
    })
  })
})
