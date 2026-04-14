import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepositoryList } from './RepositoryList'
import { getRepositoriesData } from '../model/getRepositoriesData'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// 1. Mockiamo l'API di recupero dati
vi.mock('../model/getRepositoriesData', () => ({
  getRepositoriesData: vi.fn(),
}))

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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("dovrebbe mostrare il messaggio di caricamento all'inizio", () => {
    // Facciamo in modo che la promessa resti "pendente"
    vi.mocked(getRepositoriesData).mockReturnValue(new Promise(() => {}))

    renderWithClient(<RepositoryList workspaceId={workspaceId} />)
    expect(screen.getByText(/caricamento/i)).toBeInTheDocument()
  })

  it('dovrebbe mostrare un messaggio se non ci sono repository', async () => {
    vi.mocked(getRepositoriesData).mockResolvedValue([])

    renderWithClient(<RepositoryList workspaceId={workspaceId} />)

    await waitFor(() => {
      expect(
        screen.getByText(/nessun repository aggiunto/i),
      ).toBeInTheDocument()
    })
  })

  it('dovrebbe renderizzare la lista di repository quando i dati arrivano', async () => {
    const mockRepos = [
      {
        repositoryId: 'repo-1',
        name: 'app-frontend',
        ownerName: 'giacomo',
        dateScan: '2024-01-01',
        documentationScore: 80,
        codeCoverage: 70,
        cvss: 0,
      },
      {
        repositoryId: 'repo-2',
        name: 'api-backend',
        ownerName: 'giacomo',
        dateScan: '2024-01-02',
        documentationScore: 90,
        codeCoverage: 85,
        cvss: 2,
      },
    ]
    vi.mocked(getRepositoriesData).mockResolvedValue(mockRepos)

    renderWithClient(<RepositoryList workspaceId={workspaceId} />)

    // Verifichiamo che i nomi delle repo appaiano sullo schermo
    await waitFor(() => {
      expect(screen.getByText('app-frontend')).toBeInTheDocument()
      expect(screen.getByText('api-backend')).toBeInTheDocument()
    })
  })

  it("dovrebbe chiamare l'API con il termine di ricerca corretto quando l'utente digita", async () => {
    const user = userEvent.setup()
    vi.mocked(getRepositoriesData).mockResolvedValue([])

    renderWithClient(<RepositoryList workspaceId={workspaceId} />)

    const searchInput = screen.getByPlaceholderText(/cerca per nome/i)
    await user.type(searchInput, 'test-search')

    // Verifichiamo che l'API sia stata richiamata con il parametro di ricerca
    await waitFor(() => {
      expect(getRepositoriesData).toHaveBeenCalledWith(
        workspaceId,
        'test-search',
      )
    })
  })
})
