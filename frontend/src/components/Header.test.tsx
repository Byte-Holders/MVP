import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Header from './Header'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

vi.mock('./ThemeToggle', () => ({
  default: () => <button>ThemeToggle</button>,
}))

vi.mock('@/features/createWorkspace/components/NewWorkspaceDialog', () => ({
  NewWorkspaceDialog: () => <div data-testid="new-workspace-dialog" />,
}))

vi.mock('../features/auth/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

import { useAuthContext } from '../features/auth/AuthContext'

const mockLogin = vi.fn()
const mockLogout = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Header', () => {
  describe('stato di caricamento', () => {
    it('non mostra Accedi né Logout durante il caricamento', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        login: mockLogin,
        logout: mockLogout,
      } as any)

      render(<Header />)

      expect(screen.queryByText('Accedi')).not.toBeInTheDocument()
      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })
  })

  describe('utente non autenticato', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
      } as any)
    })

    it('mostra il bottone Accedi', () => {
      render(<Header />)
      expect(screen.getByText('Accedi')).toBeInTheDocument()
    })

    it('non mostra Logout né NewWorkspaceDialog', () => {
      render(<Header />)
      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('new-workspace-dialog'),
      ).not.toBeInTheDocument()
    })

    it('chiama login al click su Accedi', async () => {
      render(<Header />)
      await userEvent.click(screen.getByText('Accedi'))
      expect(mockLogin).toHaveBeenCalledTimes(1)
    })

    it('non mostra il bottone Notifiche', () => {
      render(<Header />)
      expect(screen.queryByText('Notifiche')).not.toBeInTheDocument()
    })
  })

  describe('utente autenticato', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
      } as any)
    })

    it('mostra il bottone Logout', () => {
      render(<Header />)
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('mostra NewWorkspaceDialog', () => {
      render(<Header />)
      expect(screen.getByTestId('new-workspace-dialog')).toBeInTheDocument()
    })

    it('non mostra Accedi', () => {
      render(<Header />)
      expect(screen.queryByText('Accedi')).not.toBeInTheDocument()
    })

    it('non mostra il bottone Notifiche', () => {
      render(<Header />)
      expect(screen.queryByText('Notifiche')).not.toBeInTheDocument()
    })

    it('chiama logout al click su Logout', async () => {
      render(<Header />)
      await userEvent.click(screen.getByText('Logout'))
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe('navigazione', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: true, // ← era false
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
      } as any)
    })

    it('mostra il link Workspace', () => {
      render(<Header />)
      expect(screen.getByText('Workspace')).toBeInTheDocument()
    })

    it('mostra il link Inviti', () => {
      render(<Header />)
      expect(screen.getByText('Inviti')).toBeInTheDocument()
    })

    it('mostra il logo con link alla homepage', () => {
      render(<Header />)
      expect(screen.getByAltText('Logo')).toBeInTheDocument()
    })
  })

  describe('navigazione — utente non autenticato', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
      } as any)
    })

    it('non mostra il link Workspace', () => {
      render(<Header />)
      expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
    })

    it('non mostra il link Inviti', () => {
      render(<Header />)
      expect(screen.queryByText('Inviti')).not.toBeInTheDocument()
    })

    it('mostra il pulsante Accedi', () => {
      render(<Header />)
      expect(screen.getByText('Accedi')).toBeInTheDocument()
    })
  })
})
