import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Footer from './Footer'

describe('Footer', () => {
  it('mostra il copyright con anno corrente', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year}`)).toBeInTheDocument()
  })

  it('mostra il nome del gruppo', () => {
    render(<Footer />)
    expect(screen.getByText('Realizzato dal gruppo Byte-Holders')).toBeInTheDocument()
  })

  it('mostra il nome del prodotto', () => {
    render(<Footer />)
    expect(screen.getByText('CodeGuardian')).toBeInTheDocument()
  })

  it('mostra il logo', () => {
    render(<Footer />)
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
  })

  it('non contiene link social', () => {
    render(<Footer />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
