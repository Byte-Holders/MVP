import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDeleteWorkspace } from './useDeleteWorkspace'

// Mocka il repository di default — useDeleteWorkspace lo accetta anche come
// dipendenza iniettata, ma lo spy sul default ci basta per i test senza DI
vi.mock('../model/deleteWorkspace.api', () => ({
  deleteWorkspaceRepository: { deleteWorkspace: vi.fn() },
}))

import { deleteWorkspaceRepository } from '../model/deleteWorkspace.api'

describe('useDeleteWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- stato iniziale ---

  it('parte con loading = false ed error = null', () => {
    const { result } = renderHook(() => useDeleteWorkspace())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  // --- caso nominale ---

  it('chiama repo.deleteWorkspace con il workspaceId corretto', async () => {
    vi.mocked(deleteWorkspaceRepository.deleteWorkspace).mockResolvedValue(
      undefined,
    )

    const { result } = renderHook(() => useDeleteWorkspace())

    await act(async () => {
      await result.current.execute('ws-1')
    })

    expect(deleteWorkspaceRepository.deleteWorkspace).toHaveBeenCalledWith({
      workspaceId: 'ws-1',
    })
  })

  it("imposta loading = true durante l'operazione e loading = false al termine", async () => {
    let resolveDelete!: () => void
    vi.mocked(deleteWorkspaceRepository.deleteWorkspace).mockReturnValue(
      new Promise<void>((res) => {
        resolveDelete = res
      }),
    )

    const { result } = renderHook(() => useDeleteWorkspace())

    // Avvia l'operazione (senza await — non risolve ancora)
    act(() => {
      void result.current.execute('ws-1')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    // Risolve la promise e verifica che loading torni false
    await act(async () => {
      resolveDelete()
    })

    expect(result.current.loading).toBe(false)
  })

  it("imposta error = null all'inizio di una nuova chiamata (reset tra tentativi)", async () => {
    // Prima chiamata fallisce
    vi.mocked(deleteWorkspaceRepository.deleteWorkspace).mockRejectedValueOnce(
      new Error('Primo errore'),
    )

    const { result } = renderHook(() => useDeleteWorkspace())

    await act(async () => {
      try {
        await result.current.execute('ws-1')
      } catch {
        // atteso
      }
    })
    expect(result.current.error).toBe('Primo errore')

    // Seconda chiamata — error deve essere resettato prima della chiamata
    vi.mocked(deleteWorkspaceRepository.deleteWorkspace).mockResolvedValue(
      undefined,
    )
    await act(async () => {
      await result.current.execute('ws-1')
    })

    expect(result.current.error).toBeNull()
  })

  // --- caso di errore ---

  it("imposta error con il messaggio dell'eccezione se deleteWorkspace fallisce", async () => {
    vi.mocked(deleteWorkspaceRepository.deleteWorkspace).mockRejectedValue(
      new Error('Solo il proprietario può cancellare il workspace'),
    )

    const { result } = renderHook(() => useDeleteWorkspace())

    await act(async () => {
      try {
        await result.current.execute('ws-1')
      } catch {
        // l'hook rilancia — gestiamo qui per non far fallire il test
      }
    })

    expect(result.current.error).toBe(
      'Solo il proprietario può cancellare il workspace',
    )
  })

  it("rilancia l'eccezione dopo aver impostato error (per permettere al chiamante di gestirla)", async () => {
    vi.mocked(deleteWorkspaceRepository.deleteWorkspace).mockRejectedValue(
      new Error('Workspace non trovato'),
    )

    const { result } = renderHook(() => useDeleteWorkspace())

    await expect(
      act(async () => {
        await result.current.execute('ws-inesistente')
      }),
    ).rejects.toThrow('Workspace non trovato')
  })

  it('imposta loading = false anche in caso di errore (blocco finally)', async () => {
    vi.mocked(deleteWorkspaceRepository.deleteWorkspace).mockRejectedValue(
      new Error('Errore generico'),
    )

    const { result } = renderHook(() => useDeleteWorkspace())

    await act(async () => {
      try {
        await result.current.execute('ws-1')
      } catch {
        // atteso
      }
    })

    expect(result.current.loading).toBe(false)
  })
})
