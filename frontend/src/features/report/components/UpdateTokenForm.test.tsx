import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UpdateTokenForm } from './UpdateTokenForm'
import type { ReactElement } from 'react'

vi.mock('#/features/workspaceRepository/model/updateTokenData', () => ({
  updateTokenRepository: { updateToken: vi.fn() },
}))

import { updateTokenRepository } from '#/features/workspaceRepository/model/updateTokenData'

const renderWithClient = (ui: ReactElement) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      {ui}
    </QueryClientProvider>,
  )

describe('UpdateTokenForm Component', () => {
  const props = { workspaceId: 'ws-1', repositoryId: 'repo-1' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an error on malformed token', async () => {
    const user = userEvent.setup()
    renderWithClient(<UpdateTokenForm {...props} />)

    await user.click(screen.getByRole('button', { name: /aggiorna github token/i }))
    await user.type(
      screen.getByPlaceholderText('GitHub token'),
      'myInvalidToken',
    )
    await user.click(screen.getByRole('button', { name: /salva/i }))

    expect(screen.getByText('Token non valido')).toBeInTheDocument()
    expect(updateTokenRepository.updateToken).not.toHaveBeenCalled()
  })

  it('mostra errore del backend se la chiamata API fallisce', async () => {
    const errorMessage = 'myError'
    const user = userEvent.setup()

    vi.mocked(updateTokenRepository.updateToken).mockRejectedValue(
      new Error(errorMessage),
    )
    renderWithClient(<UpdateTokenForm {...props} />)

    await user.click(screen.getByRole('button', { name: /aggiorna github token/i }))
    await user.type(
      screen.getByPlaceholderText('GitHub token'),
      'ghp_' + 'a'.repeat(36),
    )
    await user.click(screen.getByRole('button', { name: /salva/i }))

    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })
})
