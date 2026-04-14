import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorkspaceList } from './WorkspaceList'
import { getWorkspaces } from '../model/getWorkspacesApi'

vi.mock('../model/getWorkspacesApi', () => ({
  getWorkspaces: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('WorkspaceList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("dovrebbe mostrare il messaggio di caricamento all'inizio", () => {
    vi.mocked(getWorkspaces).mockReturnValue(new Promise(() => {}))
    render(<WorkspaceList />)
    expect(screen.getByText(/loading workspaces/i)).toBeInTheDocument()
  })

  it('dovrebbe mostrare un errore se la chiamata API fallisce', async () => {
    vi.mocked(getWorkspaces).mockRejectedValue(new Error('Errore di rete'))
    render(<WorkspaceList />)
    await waitFor(() => {
      expect(screen.getByText('Errore di rete')).toBeInTheDocument()
    })
  })

  it('dovrebbe mostrare un messaggio se non ci sono workspace', async () => {
    vi.mocked(getWorkspaces).mockResolvedValue([])
    render(<WorkspaceList />)
    await waitFor(() => {
      expect(screen.getByText(/no workspaces yet/i)).toBeInTheDocument()
    })
  })

  it('dovrebbe renderizzare tutti i workspace quando i dati arrivano', async () => {
    vi.mocked(getWorkspaces).mockResolvedValue([
      { id: 'ws-1', name: 'Workspace Alpha', owner: 'alice', role: 'owner' },
      { id: 'ws-2', name: 'Workspace Beta', owner: 'bob', role: 'member' },
    ])
    render(<WorkspaceList />)
    await waitFor(() => {
      expect(screen.getByText('Workspace Alpha')).toBeInTheDocument()
      expect(screen.getByText('Workspace Beta')).toBeInTheDocument()
    })
  })

  it('non dovrebbe mostrare il loader dopo il caricamento', async () => {
    vi.mocked(getWorkspaces).mockResolvedValue([])
    render(<WorkspaceList />)
    await waitFor(() => {
      expect(screen.queryByText(/loading workspaces/i)).not.toBeInTheDocument()
    })
  })
})
