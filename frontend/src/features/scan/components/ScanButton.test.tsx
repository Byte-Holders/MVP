import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScanButton } from './ScanButton'

vi.mock('../hooks/useScan', () => ({
  useScan: vi.fn(),
  useStopScan: vi.fn(),
  useScanStatus: vi.fn(),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({ removeQueries: vi.fn() })),
  }
})

import { useScan, useStopScan, useScanStatus } from '../hooks/useScan'

const defaultScan = {
  triggerScan: vi.fn(),
  scanId: undefined,
  isPending: false,
  isSuccess: false,
  error: null,
  reset: vi.fn(),
}

const defaultStop = {
  triggerStop: vi.fn(),
  isStopping: false,
  stopError: null,
  resetStop: vi.fn(),
}

const props = { workspaceId: 'ws-1', repositoryId: 'repo-1', branch: 'develop' }

describe('ScanButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useScan).mockReturnValue(defaultScan)
    vi.mocked(useStopScan).mockReturnValue(defaultStop)
    vi.mocked(useScanStatus).mockReturnValue({
      scanStatus: undefined,
      isStatusLoading: false,
    })
  })

  it('dovrebbe mostrare il bottone "Lancia scansione" di default', () => {
    render(<ScanButton {...props} />)
    expect(
      screen.getByRole('button', { name: 'Lancia scansione' }),
    ).toBeInTheDocument()
  })

  it('dovrebbe chiamare reset e triggerScan al click', () => {
    const reset = vi.fn()
    const triggerScan = vi.fn()
    vi.mocked(useScan).mockReturnValue({ ...defaultScan, reset, triggerScan })
    render(<ScanButton {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Lancia scansione' }))
    expect(reset).toHaveBeenCalled()
    expect(triggerScan).toHaveBeenCalled()
  })

  it('dovrebbe mostrare "Avvio..." e disabilitare il bottone durante isPending', () => {
    vi.mocked(useScan).mockReturnValue({ ...defaultScan, isPending: true })
    render(<ScanButton {...props} />)
    const btn = screen.getByRole('button', { name: 'Avvio...' })
    expect(btn).toBeDisabled()
  })

  it('dovrebbe disabilitare il bottone se branch è vuoto', () => {
    render(<ScanButton workspaceId="ws-1" repositoryId="repo-1" branch="" />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('dovrebbe mostrare il bottone "Ferma scansione" quando la scansione è in corso', () => {
    vi.mocked(useScan).mockReturnValue({
      ...defaultScan,
      isSuccess: true,
      scanId: 'scan-abc',
    })
    render(<ScanButton {...props} />)
    expect(
      screen.getByRole('button', { name: 'Ferma scansione' }),
    ).toBeInTheDocument()
  })

  it('dovrebbe mostrare "Arresto..." e disabilitare durante isStopping', () => {
    vi.mocked(useScan).mockReturnValue({
      ...defaultScan,
      isSuccess: true,
      scanId: 'scan-abc',
    })
    vi.mocked(useStopScan).mockReturnValue({ ...defaultStop, isStopping: true })
    render(<ScanButton {...props} />)
    const btn = screen.getByRole('button', { name: 'Arresto...' })
    expect(btn).toBeDisabled()
  })

  it('dovrebbe mostrare il messaggio di errore scan', () => {
    vi.mocked(useScan).mockReturnValue({
      ...defaultScan,
      error: new Error('Errore avvio'),
    })
    render(<ScanButton {...props} />)
    expect(screen.getByText('Errore avvio')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il messaggio di errore stop', () => {
    vi.mocked(useScan).mockReturnValue({
      ...defaultScan,
      isSuccess: true,
      scanId: 'scan-abc',
    })
    vi.mocked(useStopScan).mockReturnValue({
      ...defaultStop,
      stopError: new Error('Errore stop'),
    })
    render(<ScanButton {...props} />)
    expect(screen.getByText('Errore stop')).toBeInTheDocument()
  })
})
