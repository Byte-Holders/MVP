import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InviteForm } from './InviteForm'

// Props di base riutilizzabili
const defaultProps = {
  username: '',
  role: 'Developer' as any,
  isPending: false,
  error: null,
  isSuccess: false,
  onUsernameChange: vi.fn(),
  onRoleChange: vi.fn(),
  onSubmit: vi.fn(),
}

describe('InviteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- rendering base ---

  it('mostra il campo input per lo username con placeholder corretto', () => {
    render(<InviteForm {...defaultProps} />)
    expect(screen.getByPlaceholderText('es. mario_rossi')).toBeInTheDocument()
  })

  it('mostra il selettore del ruolo', () => {
    render(<InviteForm {...defaultProps} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('mostra il pulsante "Invita"', () => {
    render(<InviteForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Invita' })).toBeInTheDocument()
  })

  // --- pulsante disabilitato ---

  it('disabilita il pulsante "Invita" quando isPending = true', () => {
    render(<InviteForm {...defaultProps} isPending={true} username="mario" />)
    expect(screen.getByRole('button', { name: 'Invio...' })).toBeDisabled()
  })

  it('mostra il testo "Invio..." nel pulsante quando isPending = true', () => {
    render(<InviteForm {...defaultProps} isPending={true} username="mario" />)
    expect(screen.getByText('Invio...')).toBeInTheDocument()
  })

  it('disabilita il pulsante "Invita" quando username è stringa vuota', () => {
    render(<InviteForm {...defaultProps} username="" />)
    expect(screen.getByRole('button', { name: 'Invita' })).toBeDisabled()
  })

  it('abilita il pulsante "Invita" quando username non è vuoto e isPending = false', () => {
    render(<InviteForm {...defaultProps} username="mario" />)
    expect(screen.getByRole('button', { name: 'Invita' })).toBeEnabled()
  })

  // --- messaggi di stato ---

  it('mostra il messaggio di errore quando error non è null', () => {
    render(
      <InviteForm {...defaultProps} error={new Error('Utente non trovato')} />,
    )
    expect(screen.getByText('Utente non trovato')).toBeInTheDocument()
  })

  it('mostra "Invito inviato con successo." quando isSuccess = true', () => {
    render(<InviteForm {...defaultProps} isSuccess={true} />)
    expect(screen.getByText('Invito inviato con successo.')).toBeInTheDocument()
  })

  it('non mostra il messaggio di successo quando isSuccess = false', () => {
    render(<InviteForm {...defaultProps} isSuccess={false} />)
    expect(
      screen.queryByText('Invito inviato con successo.'),
    ).not.toBeInTheDocument()
  })
})
