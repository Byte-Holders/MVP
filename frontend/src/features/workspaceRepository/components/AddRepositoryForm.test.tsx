import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddRepositoryForm } from './AddRepositoryForm'
import { addRepositoryData } from '../model/addRepositoryData'

// Mock della chiamata API
vi.mock('../model/addRepositoryData', () => ({
  addRepositoryData: vi.fn(),
}))

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('AddRepositoryForm Component', () => {
  const workspaceId = 'ws-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe mostrare il campo token solo se si seleziona "Privata"', async () => {
    const user = userEvent.setup()
    renderWithClient(<AddRepositoryForm workspaceId={workspaceId} />)

    // All'inizio il token non c'è (è pubblica di default)
    expect(
      screen.queryByPlaceholderText('GitHub token'),
    ).not.toBeInTheDocument()

    // L'utente clicca su "Privata"
    const privateRadio = screen.getByLabelText('Privata')
    await user.click(privateRadio)

    // Ora l'input del token deve essere visibile
    expect(screen.getByPlaceholderText('GitHub token')).toBeInTheDocument()
  })

  it('dovrebbe inviare i dati corretti per una repository pubblica', async () => {
    const user = userEvent.setup()
    renderWithClient(<AddRepositoryForm workspaceId={workspaceId} />)

    // Compila l'URL
    const urlInput = screen.getByPlaceholderText(/URL repository/i)
    await user.type(urlInput, 'https://github.com/user/repo')

    // Invia il form
    const submitButton = screen.getByRole('button', { name: /aggiungi/i })
    await user.click(submitButton)

    // Verifica che l'API sia stata chiamata con l'URL ma SENZA accessToken
    expect(addRepositoryData).toHaveBeenCalledWith(workspaceId, {
      repositoryUrl: 'https://github.com/user/repo',
      accessToken: undefined,
    })
  })
})
