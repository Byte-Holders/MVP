import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddRepositoryForm } from './AddRepositoryForm'
import type { ReactElement } from 'react'

vi.mock('../model/workspaceRepositoryRepository', () => ({
  workspaceRepositoryRepository: {
    getRepositories: vi.fn(),
    addRepository: vi.fn(),
    removeRepository: vi.fn(),
  },
}))

import { workspaceRepositoryRepository } from '../model/workspaceRepositoryRepository'

const renderWithClient = (ui: ReactElement) => {
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

    expect(
      screen.queryByPlaceholderText('GitHub token'),
    ).not.toBeInTheDocument()

    const privateRadio = screen.getByLabelText('Privata')
    await user.click(privateRadio)

    expect(screen.getByPlaceholderText('GitHub token')).toBeInTheDocument()
  })

  it('dovrebbe inviare i dati corretti per una repository pubblica', async () => {
    const user = userEvent.setup()
    vi.mocked(workspaceRepositoryRepository.addRepository).mockResolvedValue(
      undefined,
    )
    renderWithClient(<AddRepositoryForm workspaceId={workspaceId} />)

    const urlInput = screen.getByPlaceholderText(/URL repository/i)
    await user.type(urlInput, 'https://github.com/user/repo')

    const submitButton = screen.getByRole('button', { name: /aggiungi/i })
    await user.click(submitButton)

    expect(workspaceRepositoryRepository.addRepository).toHaveBeenCalledWith(
      workspaceId,
      {
        repositoryUrl: 'https://github.com/user/repo',
        accessToken: undefined,
      },
    )
  })
})
