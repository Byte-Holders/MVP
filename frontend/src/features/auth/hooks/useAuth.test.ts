import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from './useAuth'

// Mocka il model layer — nessuna chiamata reale ad Amplify
jest.mock('../model/authApi', () => ({
  fetchCurrentUser: jest.fn(),
  fetchSession: jest.fn(),
  signIn: jest.fn(),
  logOut: jest.fn(),
}))

import {
  fetchCurrentUser,
  fetchSession,
  signIn,
  logOut,
} from '../model/authApi'

const mockFetchCurrentUser = fetchCurrentUser as jest.Mock
const mockFetchSession = fetchSession as jest.Mock
const mockSignIn = signIn as jest.Mock
const mockLogOut = logOut as jest.Mock

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
  })

  //  stato iniziale

  it('parte con isLoading true e isAuthenticated false', () => {
    // checkAuth non risolve ancora — blocca la promise
    mockFetchCurrentUser.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  //  checkAuth — successo

  it('imposta isAuthenticated true se la sessione è valida', async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockFetchSession.mockResolvedValue({
      tokens: { idToken: 'id-token-xyz' },
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({ username: 'user1' })
  })

  it('imposta isAuthenticated false se tokens è undefined', async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    // Sessione senza tokens — utente non autenticato
    mockFetchSession.mockResolvedValue({ tokens: undefined })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
  })

  //  checkAuth — fallimento

  it('imposta isAuthenticated false se fetchCurrentUser lancia errore', async () => {
    // Utente non loggato — Amplify lancia un errore
    mockFetchCurrentUser.mockRejectedValue(new Error('No current user'))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('imposta isLoading false anche in caso di errore', async () => {
    mockFetchCurrentUser.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Non deve restare bloccato in loading
    expect(result.current.isLoading).toBe(false)
  })

  // login

  it('chiama signIn con il redirectTo fornito', async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockFetchSession.mockResolvedValue({ tokens: { idToken: 'token' } })
    mockSignIn.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login('/workspaces')
    })

    expect(mockSignIn).toHaveBeenCalledWith('/workspaces')
  })

  it('chiama signIn senza argomenti se redirectTo non è fornito', async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockFetchSession.mockResolvedValue({ tokens: { idToken: 'token' } })
    mockSignIn.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login()
    })

    expect(mockSignIn).toHaveBeenCalledWith(undefined)
  })

  // logout

  it('chiama logOut', async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockFetchSession.mockResolvedValue({ tokens: { idToken: 'token' } })
    mockLogOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.logout()
    })

    expect(mockLogOut).toHaveBeenCalled()
  })

  // authState resettato dopo logout
  it('Impostazione di isAuthenticated false dopo logout', async () => {
    mockFetchCurrentUser.mockResolvedValue({ username: 'user1' })
    mockFetchSession.mockResolvedValue({ tokens: { idToken: 'token' } })
    mockLogOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    await act(async () => {
      await result.current.logout()
    })

    // Fallisce finché non si aggiunge il reset dello stato in logout()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
