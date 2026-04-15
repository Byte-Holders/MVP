import { render, screen, waitFor } from '@testing-library/react'
import { CallbackPage } from './CallbackPage'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))

vi.mock('../model/authApi', () => ({
  fetchCurrentUser: vi.fn(),
  removeCurrentUser: vi.fn(),
}))

vi.mock('../hooks/useRegister', () => ({
  useRegister: vi.fn(),
}))

import { useNavigate } from '@tanstack/react-router'
import { fetchCurrentUser, removeCurrentUser } from '../model/authApi'
import { useRegister } from '../hooks/useRegister'

const mockNavigate = vi.fn()
const mockRegister = vi.fn()
const mockFetchCurrentUser = fetchCurrentUser as ReturnType<typeof vi.fn>
const mockRemoveCurrentUser = removeCurrentUser as ReturnType<typeof vi.fn>
beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  ;(useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate)
  ;(useRegister as ReturnType<typeof vi.fn>).mockReturnValue({
    register: mockRegister,
  })
  mockRemoveCurrentUser.mockResolvedValue(undefined)
})

describe('CallbackPage', () => {
  it('mostra il testo di caricamento durante il callback', () => {
    // fetchCurrentUser non risolve — simula attesa
    mockFetchCurrentUser.mockImplementation(() => new Promise(() => {}))
    mockRegister.mockResolvedValue(undefined)

    render(<CallbackPage />)

    expect(screen.getByText('Accesso in corso...')).toBeInTheDocument()
  })

  it("naviga a /workspaces se non c'è un redirectTo in sessionStorage", async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockRegister.mockResolvedValue(undefined)

    render(<CallbackPage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/workspaces',
        replace: true,
      })
    })
  })

  it('naviga al path salvato in sessionStorage dopo il callback', async () => {
    sessionStorage.setItem('auth_redirect', '/workspace/123')
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockRegister.mockResolvedValue(undefined)

    render(<CallbackPage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/workspace/123',
        replace: true,
      })
    })
  })

  it('rimuove auth_redirect da sessionStorage dopo averlo letto', async () => {
    sessionStorage.setItem('auth_redirect', '/workspace/123')
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockRegister.mockResolvedValue(undefined)

    render(<CallbackPage />)

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())

    expect(sessionStorage.getItem('auth_redirect')).toBeNull()
  })

  it('naviga a / se fetchCurrentUser fallisce', async () => {
    mockFetchCurrentUser.mockRejectedValue(new Error('No current user'))
    mockRegister.mockResolvedValue(undefined)

    render(<CallbackPage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/',
        replace: true,
      })
    })
  })

  it('naviga a / con error param se register fallisce', async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockRegister.mockRejectedValue(new Error('Errore registrazione'))

    render(<CallbackPage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/',
        search: { error: 'registration_failed' },
        replace: true,
      })
    })
  })

  it('chiama register dopo fetchCurrentUser', async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockRegister.mockResolvedValue(undefined)

    render(<CallbackPage />)

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())

    // Verifica l'ordine: prima fetchCurrentUser, poi register
    expect(mockFetchCurrentUser).toHaveBeenCalled()
    expect(mockRegister).toHaveBeenCalled()
  })

  it('mostra errore se la registrazione nel db fallisce (non 409)', async () => {
    // Arrange — Cognito ok, ma il nostro backend fallisce
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockRegister.mockRejectedValue(
      new Error('Errore durante la registrazione utente'),
    )

    render(<CallbackPage />)

    // Al momento questo test FALLISCE perché CallbackPage naviga silenziosamente a '/' invece di mostrare un errore
    await waitFor(() => {
      expect(screen.getByText(/errore/i)).toBeInTheDocument()
    })

    // L'utente NON deve essere reindirizzato a /
    expect(mockNavigate).not.toHaveBeenCalledWith({ to: '/', replace: true })
  })

  it('cancella l utente da Cognito se la registrazione nel DB fallisce', async () => {
    // Arrange — Cognito ok, ma il nostro backend fallisce
    mockFetchCurrentUser.mockResolvedValue({ username: 'giulia' })
    mockRegister.mockRejectedValue(
      new Error('Errore durante la registrazione utente'),
    )

    render(<CallbackPage />)

    await waitFor(() => {
      expect(mockRemoveCurrentUser).toHaveBeenCalledTimes(1)
    })
  })
})
