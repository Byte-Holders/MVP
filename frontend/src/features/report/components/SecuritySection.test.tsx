import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SecuritySection } from './SecuritySection'

vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  LabelList: () => null,
  Rectangle: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))
vi.mock('../../../components/ScoreBar', () => ({
  ScoreBar: ({ label, value }: { label: string; value: number }) => (
    <div data-testid="score-bar">{label}: {value}</div>
  ),
}))

const emptyProps = {
  vulnerabilitiesReport: { vulnerabilities: [], mark: 9 },
  depsReport: { vulnerabilities: [], vulnerabilityAnalysis: '' },
}

const propsWithVulns = {
  vulnerabilitiesReport: {
    vulnerabilities: [
      { id: 'CVE-001', path: 'src/auth.ts', description: 'SQL Injection', remediation: 'Usa prepared statements', severity: 9, impact: 'Critical', category: 'Injection', cwe: 'CWE-89', owasp: ['A03'] },
      { id: 'CVE-002', path: 'src/api.ts', description: 'XSS', remediation: 'Sanifica input', severity: 5, impact: 'Medium', category: 'XSS' },
    ],
    mark: 4,
  },
  depsReport: {
    vulnerabilities: [
      { id: 'DEP-001', severity: 'High', packageName: 'lodash', packageVersion: '4.17.0', description: 'Prototype pollution', fixVersion: '4.17.21' },
      { id: 'DEP-002', severity: 'Critical', packageName: 'axios', packageVersion: '0.21.0', description: 'SSRF' },
    ],
    vulnerabilityAnalysis: 'Aggiornare le dipendenze.',
  },
}

describe('SecuritySection', () => {
  it('dovrebbe mostrare il titolo della sezione', () => {
    render(<SecuritySection {...emptyProps} />)
    expect(screen.getByText('Analisi della sicurezza')).toBeInTheDocument()
  })

  it('dovrebbe mostrare lo ScoreBar con il voto', () => {
    render(<SecuritySection {...emptyProps} />)
    expect(screen.getByTestId('score-bar')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il messaggio verde se non ci sono vulnerabilità', () => {
    render(<SecuritySection {...emptyProps} />)
    expect(screen.getByText('Nessuna vulnerabilità rilevata.')).toBeInTheDocument()
  })

  it('dovrebbe mostrare i contatori overview', () => {
    render(<SecuritySection {...propsWithVulns} />)
    expect(screen.getByText('Vulnerabilità codice')).toBeInTheDocument()
    expect(screen.getByText('Dipendenze vulnerabili')).toBeInTheDocument()
  })

  it('dovrebbe mostrare le vulnerabilità del codice', () => {
    render(<SecuritySection {...propsWithVulns} />)
    expect(screen.getByText('SQL Injection')).toBeInTheDocument()
    expect(screen.getByText('XSS')).toBeInTheDocument()
  })

  it('dovrebbe espandere una vulnerabilità al click', () => {
    render(<SecuritySection {...propsWithVulns} />)
    fireEvent.click(screen.getByText('SQL Injection').closest('button')!)
    expect(screen.getByText('src/auth.ts')).toBeInTheDocument()
    expect(screen.getByText('Usa prepared statements')).toBeInTheDocument()
    expect(screen.getByText('CWE-89')).toBeInTheDocument()
    expect(screen.getByText('A03')).toBeInTheDocument()
  })

  it('dovrebbe chiudere la vulnerabilità espansa al secondo click', () => {
    render(<SecuritySection {...propsWithVulns} />)
    const btn = screen.getByText('SQL Injection').closest('button')!
    fireEvent.click(btn)
    expect(screen.getByText('src/auth.ts')).toBeInTheDocument()
    fireEvent.click(btn)
    expect(screen.queryByText('src/auth.ts')).not.toBeInTheDocument()
  })

  it('dovrebbe mostrare il toggle delle dipendenze vulnerabili', () => {
    render(<SecuritySection {...propsWithVulns} />)
    expect(screen.getByText(/Dipendenze vulnerabili \(2 pacchetti/)).toBeInTheDocument()
  })

  it('dovrebbe espandere la tabella dipendenze al click', () => {
    render(<SecuritySection {...propsWithVulns} />)
    fireEvent.click(screen.getByText(/Dipendenze vulnerabili \(2 pacchetti/))
    expect(screen.getByText('lodash@4.17.0')).toBeInTheDocument()
    expect(screen.getByText('axios@0.21.0')).toBeInTheDocument()
    expect(screen.getByText('4.17.21')).toBeInTheDocument()
  })

  it('dovrebbe mostrare l analisi testuale se presente', () => {
    render(<SecuritySection {...propsWithVulns} />)
    expect(screen.getByText('Aggiornare le dipendenze.')).toBeInTheDocument()
  })

  it('dovrebbe usare vulnCounts se disponibile invece di iterare le vulnerabilità', () => {
    const propsWithCounts = {
      vulnerabilitiesReport: {
        vulnerabilities: [],
        mark: 7,
        vulnCounts: { critical: 2, high: 3, medium: 1, low: 0 },
      },
      depsReport: {
        vulnerabilities: [],
        vulnerabilityAnalysis: '',
        vulnCounts: { critical: 1, high: 0, medium: 2, low: 5 },
      },
    }
    render(<SecuritySection {...propsWithCounts} />)
    // totale codice: 2+3+1+0 = 6, totale deps: 1+0+2+5 = 8
    const counts = screen.getAllByText('6')
    expect(counts.length).toBeGreaterThan(0)
  })
})
