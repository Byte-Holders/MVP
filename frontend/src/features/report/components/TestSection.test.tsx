import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TestSection } from './TestSection'

vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))

const baseReport = {
  coverageReport: { statements: 80, branches: 70, functions: 90, lines: 85 },
  failedTests: [],
  testsRun: 42,
}

describe('TestSection', () => {
  it('dovrebbe mostrare il numero di test eseguiti', () => {
    render(<TestSection testReport={baseReport} />)
    expect(screen.getByText('42 test eseguiti')).toBeInTheDocument()
  })

  it('dovrebbe calcolare e mostrare la coverage media', () => {
    render(<TestSection testReport={baseReport} />)
    // (80 + 70 + 90 + 85) / 4 = 81.25 → toFixed(0) = 81
    expect(screen.getByText('81')).toBeInTheDocument()
  })

  it('dovrebbe mostrare i valori di coverage per categoria', () => {
    render(<TestSection testReport={baseReport} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il messaggio se non ci sono test', () => {
    render(<TestSection testReport={{ ...baseReport, testsRun: 0 }} />)
    expect(
      screen.getByText('Nessun test rilevato nel progetto.'),
    ).toBeInTheDocument()
  })

  it('non dovrebbe mostrare il messaggio se ci sono test', () => {
    render(<TestSection testReport={baseReport} />)
    expect(
      screen.queryByText('Nessun test rilevato nel progetto.'),
    ).not.toBeInTheDocument()
  })

  it('dovrebbe mostrare i test falliti', () => {
    const report = {
      ...baseReport,
      failedTests: [
        {
          name: 'test-a',
          path: 'src/a.test.ts',
          messageSummary: 'Expected true',
        },
      ],
    }
    render(<TestSection testReport={report} />)
    expect(screen.getByText('test-a')).toBeInTheDocument()
    expect(screen.getByText('src/a.test.ts')).toBeInTheDocument()
    expect(screen.getByText('Expected true')).toBeInTheDocument()
    expect(screen.getByText('1 falliti')).toBeInTheDocument()
  })

  it('non dovrebbe mostrare la sezione test falliti se tutti passano', () => {
    render(<TestSection testReport={baseReport} />)
    expect(screen.queryByText('Test falliti')).not.toBeInTheDocument()
  })
})
