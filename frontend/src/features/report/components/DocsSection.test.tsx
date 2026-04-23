import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DocsSection } from './DocsSection'

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <p>{children}</p>,
}))
vi.mock('remark-gfm', () => ({ default: () => {} }))
vi.mock('../../../components/ScoreBar', () => ({
  ScoreBar: ({ label, value }: { label: string; value: number }) => (
    <div data-testid="score-bar">
      {label}: {value}
    </div>
  ),
}))

const docsReport = {
  readmeReport: 'Ottimo README',
  commentReport: 'Commenti sufficienti',
  mark: 8,
}

describe('DocsSection', () => {
  it('dovrebbe mostrare il titolo della sezione', () => {
    render(<DocsSection docsReport={docsReport} />)
    expect(screen.getByText('Analisi della documentazione')).toBeInTheDocument()
  })

  it('dovrebbe mostrare lo ScoreBar con il voto corretto', () => {
    render(<DocsSection docsReport={docsReport} />)
    expect(screen.getByTestId('score-bar')).toHaveTextContent('8')
  })

  it('dovrebbe renderizzare il contenuto del readmeReport', () => {
    render(<DocsSection docsReport={docsReport} />)
    expect(screen.getByText('Ottimo README')).toBeInTheDocument()
  })

  it('dovrebbe renderizzare il contenuto del commentReport', () => {
    render(<DocsSection docsReport={docsReport} />)
    expect(screen.getByText('Commenti sufficienti')).toBeInTheDocument()
  })

  it('dovrebbe mostrare le etichette README e Commenti nel codice', () => {
    render(<DocsSection docsReport={docsReport} />)
    expect(screen.getByText('README')).toBeInTheDocument()
    expect(screen.getByText('Commenti nel codice')).toBeInTheDocument()
  })
})
