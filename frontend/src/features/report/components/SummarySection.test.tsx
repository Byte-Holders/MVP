import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SummarySection } from './SummarySection'

const summary = { summary: 'Progetto in buono stato.', mark: 8.5 }

const metadata = {
  startScanTime: '2024-01-15T10:00:00.000Z',
  endScanTime: '2024-01-15T10:02:30.000Z',
  target: { owner: 'alice', repository: 'my-repo', branch: 'develop' },
}

describe('SummarySection', () => {
  it('dovrebbe mostrare il testo del summary', () => {
    render(<SummarySection summary={summary} />)
    expect(screen.getByText('Progetto in buono stato.')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il voto nel ring', () => {
    render(<SummarySection summary={summary} />)
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('dovrebbe mostrare la durata calcolata correttamente', () => {
    render(<SummarySection summary={summary} metadata={metadata} />)
    expect(screen.getByText('2m 30s')).toBeInTheDocument()
  })

  it('dovrebbe mostrare solo secondi se la durata è inferiore a un minuto', () => {
    const shortMeta = {
      ...metadata,
      startScanTime: '2024-01-15T10:00:00.000Z',
      endScanTime: '2024-01-15T10:00:45.000Z',
    }
    render(<SummarySection summary={summary} metadata={shortMeta} />)
    expect(screen.getByText('45s')).toBeInTheDocument()
  })

  it('non dovrebbe mostrare la durata se il tempo di fine è precedente all inizio', () => {
    const invertedMeta = {
      ...metadata,
      startScanTime: '2024-01-15T10:02:30.000Z',
      endScanTime: '2024-01-15T10:00:00.000Z',
    }
    render(<SummarySection summary={summary} metadata={invertedMeta} />)
    expect(screen.queryByText('Durata')).not.toBeInTheDocument()
  })

  it('non dovrebbe mostrare i metadati se non forniti', () => {
    render(<SummarySection summary={summary} />)
    expect(screen.queryByText('Inizio scansione')).not.toBeInTheDocument()
    expect(screen.queryByText('Fine scansione')).not.toBeInTheDocument()
  })

  it('dovrebbe mostrare Inizio e Fine scansione con i metadati', () => {
    render(<SummarySection summary={summary} metadata={metadata} />)
    expect(screen.getByText('Inizio scansione')).toBeInTheDocument()
    expect(screen.getByText('Fine scansione')).toBeInTheDocument()
  })
})
