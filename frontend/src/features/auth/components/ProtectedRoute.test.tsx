import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from './ProtectedRoute'
import { describe, it, expect, vi } from 'vitest'

// Mocka useAuthContext per controllare lo stato auth nei test
vi.mock('../hooks/useAuthContext', () => ({
  useAuthContext: vi.fn(),
}))

// Mocka TanStack Router — non serve il routing reale per testare ProtectedRoute
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useRouterState: () => ({
    location: { pathname: '/workspaces' },
  }),
}))

import { useAuthContext } from '../hooks/useAuthContext'
const mockUseAuthContext = useAuthContext as ReturnType<typeof vi.fn>

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mostra il loader mentre isLoading è true', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
    })

    render(
      <ProtectedRoute>
        <div>Contenuto protetto</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Caricamento...')).toBeInTheDocument()
    expect(screen.queryByText('Contenuto protetto')).not.toBeInTheDocument()
  })

  it('non renderizza nulla se non autenticato e non in loading', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
    })

    const { container } = render(
      <ProtectedRoute>
        <div>Contenuto protetto</div>
      </ProtectedRoute>,
    )

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText('Contenuto protetto')).not.toBeInTheDocument()
  })

  it('chiama login con il path corrente se non autenticato', () => {
    const mockLogin = vi.fn()
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
    })

    render(
      <ProtectedRoute>
        <div>Contenuto protetto</div>
      </ProtectedRoute>,
    )

    // useEffect viene eseguito dopo il render
    expect(mockLogin).toHaveBeenCalledWith('/workspaces')
  })

  it('non chiama login se isLoading è true', () => {
    const mockLogin = vi.fn()
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      login: mockLogin,
    })

    render(
      <ProtectedRoute>
        <div>Contenuto protetto</div>
      </ProtectedRoute>,
    )

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('renderizza i children se autenticato', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
    })

    render(
      <ProtectedRoute>
        <div>Contenuto protetto</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Contenuto protetto')).toBeInTheDocument()
    expect(screen.queryByText('Caricamento...')).not.toBeInTheDocument()
  })

  it('non chiama login se già autenticato', () => {
    const mockLogin = vi.fn()
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: mockLogin,
    })

    render(
      <ProtectedRoute>
        <div>Contenuto protetto</div>
      </ProtectedRoute>,
    )

    expect(mockLogin).not.toHaveBeenCalled()
  })
})
