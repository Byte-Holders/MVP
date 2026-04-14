import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWorkspaces } from './useWorkspaces'
import { getWorkspaces } from '../model/getWorkspacesApi'

vi.mock('../model/getWorkspacesApi', () => ({
  getWorkspaces: vi.fn(),
}))

describe('useWorkspaces Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("dovrebbe iniziare con isLoading true e workspaces vuoti", () => {
    vi.mocked(getWorkspaces).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useWorkspaces())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.workspaces).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('dovrebbe caricare i workspace correttamente', async () => {
    const mockData = [
      { id: 'ws-1', name: 'Alpha', owner: 'alice', role: 'owner' },
    ]
    vi.mocked(getWorkspaces).mockResolvedValue(mockData)
    const { result } = renderHook(() => useWorkspaces())
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.workspaces).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('dovrebbe gestire un errore API correttamente', async () => {
    vi.mocked(getWorkspaces).mockRejectedValue(new Error('Errore di rete'))
    const { result } = renderHook(() => useWorkspaces())
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.error).toBe('Errore di rete')
    expect(result.current.workspaces).toEqual([])
  })

  it('dovrebbe aggiornare i dati quando si chiama refresh()', async () => {
    const initialData = [{ id: 'ws-1', name: 'Alpha', owner: 'alice', role: 'owner' }]
    const refreshedData = [
      { id: 'ws-1', name: 'Alpha', owner: 'alice', role: 'owner' },
      { id: 'ws-2', name: 'Beta', owner: 'bob', role: 'member' },
    ]
    vi.mocked(getWorkspaces)
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(refreshedData)

    const { result } = renderHook(() => useWorkspaces())
    await waitFor(() => {
      expect(result.current.workspaces).toEqual(initialData)
    })

    act(() => {
      result.current.refresh()
    })

    await waitFor(() => {
      expect(result.current.workspaces).toEqual(refreshedData)
    })
  })

  it('dovrebbe impostare isLoading true durante refresh()', async () => {
    vi.mocked(getWorkspaces).mockResolvedValue([])
    const { result } = renderHook(() => useWorkspaces())
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    vi.mocked(getWorkspaces).mockReturnValue(new Promise(() => {}))
    act(() => {
      result.current.refresh()
    })

    expect(result.current.isLoading).toBe(true)
  })
})
