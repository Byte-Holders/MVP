import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddRepositoryForm } from './AddRepositoryForm'
import type { ReactElement } from 'react'

vi.mock('../model/addRepositoryData', () => ({
  addRepositoryRepository: { addRepository: vi.fn() },
}))

import { addRepositoryRepository } from '../model/addRepositoryData'

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

    expect(screen.queryByPlaceholderText('GitHub token')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Privata'))

    expect(screen.getByPlaceholderText('GitHub token')).toBeInTheDocument()
  })

  it('dovrebbe inviare i dati corretti per una repository pubblica', async () => {
    const user = userEvent.setup()
    vi.mocked(addRepositoryRepository.addRepository).mockResolvedValue(undefined)
    renderWithClient(<AddRepositoryForm workspaceId={workspaceId} />)

    await user.type(
      screen.getByPlaceholderText(/URL repository/i),
      'https://github.com/user/repo',
    )
    await user.click(screen.getByRole('button', { name: /aggiungi/i }))

    expect(addRepositoryRepository.addRepository).toHaveBeenCalledWith(
      workspaceId,
      { repositoryUrl: 'https://github.com/user/repo', accessToken: undefined },
    )
  })
})
