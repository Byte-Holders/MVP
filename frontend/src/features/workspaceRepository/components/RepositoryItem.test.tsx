import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepositoryItem } from './RepositoryItem'
import type { ReactElement } from 'react'

vi.mock('../model/removeRepositoryData', () => ({
  removeRepositoryRepository: { removeRepository: vi.fn() },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { removeRepositoryRepository } from '../model/removeRepositoryData'

const renderWithClient = (ui: ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('RepositoryItem Component', () => {
  const mockRepo = {
    repositoryId: 'repo-1',
    name: 'test-repo',
    ownerName: 'alice',
    dateScan: '2024-01-01',
    documentationScore: 80,
    codeCoverage: 70,
    cvss: 0,
  }
  const workspaceId = 'ws-1'

  beforeEach(() => { vi.clearAllMocks() })

  it('dovrebbe mostrare il nome della repository', () => {
    renderWithClient(
      <RepositoryItem repository={mockRepo} workspaceId={workspaceId} />,
    )
    expect(screen.getByText('test-repo')).toBeInTheDocument()
  })

  it("dovrebbe mostrare il bottone 'Rimuovi'", () => {
    renderWithClient(
      <RepositoryItem repository={mockRepo} workspaceId={workspaceId} />,
    )
    expect(screen.getByRole('button', { name: /rimuovi/i })).toBeInTheDocument()
  })

  it('dovrebbe chiamare removeRepository al click del bottone Rimuovi', async () => {
    const user = userEvent.setup()
    vi.mocked(removeRepositoryRepository.removeRepository).mockResolvedValue(undefined)
    renderWithClient(
      <RepositoryItem repository={mockRepo} workspaceId={workspaceId} />,
    )

    await user.click(screen.getByRole('button', { name: /rimuovi/i }))

    await waitFor(() => {
      expect(removeRepositoryRepository.removeRepository).toHaveBeenCalledWith(
        workspaceId,
        mockRepo.repositoryId,
      )
    })
  })

  it('dovrebbe disabilitare il bottone durante la rimozione', async () => {
    const user = userEvent.setup()
    vi.mocked(removeRepositoryRepository.removeRepository).mockReturnValue(
      new Promise(() => {}),
    )
    renderWithClient(
      <RepositoryItem repository={mockRepo} workspaceId={workspaceId} />,
    )

    await user.click(screen.getByRole('button', { name: /rimuovi/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /rimozione/i })).toBeDisabled()
    })
  })
})
