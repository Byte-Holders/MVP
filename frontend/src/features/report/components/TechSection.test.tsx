import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TechSection } from './TechSection'

vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))

const baseTechReport = {
  languages: [
    { name: 'TypeScript', value: 85.5 },
    { name: 'CSS', value: 10.0 },
    { name: 'Shell', value: 0.3 },
  ],
  frameworks: [{ name: 'React', version: '18.2.0' }],
  libraries: [
    { name: 'axios', version: '1.6.0' },
    { name: 'zod', version: '3.22.0' },
  ],
}

describe('TechSection', () => {
  it('dovrebbe mostrare il titolo della sezione', () => {
    render(<TechSection techReport={baseTechReport} />)
    expect(screen.getByText('Informazioni tecniche')).toBeInTheDocument()
  })

  it('dovrebbe mostrare i linguaggi con valore >= 1%', () => {
    render(<TechSection techReport={baseTechReport} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('CSS')).toBeInTheDocument()
  })

  it('dovrebbe mostrare i linguaggi minori come chip con <1%', () => {
    render(<TechSection techReport={baseTechReport} />)
    expect(screen.getByText(/Shell/)).toBeInTheDocument()
    expect(screen.getByText(/Shell.*<1%/)).toBeInTheDocument()
  })

  it('dovrebbe mostrare i framework', () => {
    render(<TechSection techReport={baseTechReport} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('18.2.0')).toBeInTheDocument()
  })

  it('dovrebbe mostrare le librerie', () => {
    render(<TechSection techReport={baseTechReport} />)
    expect(screen.getByText('axios')).toBeInTheDocument()
    expect(screen.getByText('zod')).toBeInTheDocument()
  })

  it('dovrebbe mostrare "Nessuno rilevato" se non ci sono framework', () => {
    render(<TechSection techReport={{ ...baseTechReport, frameworks: [] }} />)
    expect(screen.getAllByText('Nessuno rilevato')).toHaveLength(1)
  })

  it('dovrebbe mostrare "Nessuna rilevata" se non ci sono librerie', () => {
    render(<TechSection techReport={{ ...baseTechReport, libraries: [] }} />)
    expect(screen.getByText('Nessuna rilevata')).toBeInTheDocument()
  })

  it('dovrebbe mostrare "Nessun linguaggio rilevato" se la lista è vuota', () => {
    render(<TechSection techReport={{ ...baseTechReport, languages: [] }} />)
    expect(screen.getByText('Nessun linguaggio rilevato')).toBeInTheDocument()
  })

  it('dovrebbe mostrare tutte le dipendenze se allDeps è fornito', () => {
    const allDeps = [
      { name: 'lodash', version: '4.17.21' },
      { name: 'dayjs', version: '1.11.0' },
    ]
    render(<TechSection techReport={baseTechReport} allDeps={allDeps} />)
    expect(screen.getByText(/Tutte le dipendenze rilevate \(2\)/)).toBeInTheDocument()
    expect(screen.getByText('lodash')).toBeInTheDocument()
    expect(screen.getByText('dayjs')).toBeInTheDocument()
  })

  it('non dovrebbe mostrare la sezione dipendenze se allDeps è undefined', () => {
    render(<TechSection techReport={baseTechReport} />)
    expect(screen.queryByText(/Tutte le dipendenze/)).not.toBeInTheDocument()
  })
})
