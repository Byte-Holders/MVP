import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepositoryList } from './RepositoryList'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../model/getRepositoriesData', () => ({
  getRepositoriesRepository: { getRepositories: vi.fn() },
}))

import { getRepositoriesRepository } from '../model/getRepositoriesData'

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('RepositoryList Component', () => {
  const workspaceId = 'ws-test-123'

  beforeEach(() => { vi.clearAllMocks() })

  it("dovrebbe mostrare il messaggio di caricamento all'inizio", () => {
    vi.mocked(getRepositoriesRepository.getRepositories).mockReturnValue(
      new Promise(() => {}),
    )
    renderWithClient(<RepositoryList workspaceId={workspaceId} />)
    expect(screen.getByText(/caricamento/i)).toBeInTheDocument()
  })

  it('dovrebbe mostrare un messaggio se non ci sono repository', async () => {
    vi.mocked(getRepositoriesRepository.getRepositories).mockResolvedValue([])
    renderWithClient(<RepositoryList workspaceId={workspaceId} />)
    await waitFor(() => {
      expect(screen.getByText(/nessun repository aggiunto/i)).toBeInTheDocument()
    })
  })

  it('dovrebbe renderizzare la lista di repository quando i dati arrivano', async () => {
    vi.mocked(getRepositoriesRepository.getRepositories).mockResolvedValue([
      { repositoryId: 'repo-1', name: 'app-frontend', ownerName: 'giacomo', dateScan: '2024-01-01', documentationScore: 80, codeCoverage: 70, cvss: 0 },
      { repositoryId: 'repo-2', name: 'api-backend', ownerName: 'giacomo', dateScan: '2024-01-02', documentationScore: 90, codeCoverage: 85, cvss: 2 },
    ])
    renderWithClient(<RepositoryList workspaceId={workspaceId} />)
    await waitFor(() => {
      expect(screen.getByText('app-frontend')).toBeInTheDocument()
      expect(screen.getByText('api-backend')).toBeInTheDocument()
    })
  })

  it("dovrebbe chiamare l'API con il termine di ricerca corretto", async () => {
    const user = userEvent.setup()
    vi.mocked(getRepositoriesRepository.getRepositories).mockResolvedValue([])
    renderWithClient(<RepositoryList workspaceId={workspaceId} />)

    await user.type(screen.getByPlaceholderText(/cerca per nome/i), 'test-search')

    await waitFor(() => {
      expect(getRepositoriesRepository.getRepositories).toHaveBeenCalledWith(
        workspaceId,
        'test-search',
      )
    })
  })
})
