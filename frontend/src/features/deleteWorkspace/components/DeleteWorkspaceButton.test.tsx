import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import { DeleteWorkspaceButton } from './DeleteWorkspaceButton'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockExecute = vi.fn()
const mockInvalidate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../hooks/useDeleteWorkspace', () => ({
  useDeleteWorkspace: () => ({
    execute: mockExecute,
    loading: false,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({
    invalidate: mockInvalidate,
  }),
  useNavigate: () => mockNavigate,
}))

describe('DeleteWorkspaceButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe renderizzare il bottone elimina', () => {
    render(<DeleteWorkspaceButton workspaceId="1" workspaceName="Test WS" />)

    expect(screen.getByText('Elimina')).toBeInTheDocument()
  })

  it('dovrebbe aprire il dialog al click del bottone', async () => {
    render(<DeleteWorkspaceButton workspaceId="1" workspaceName="Test WS" />)

    fireEvent.click(screen.getByText('Elimina'))

    expect(await screen.findByText(/Eliminare workspace/i)).toBeInTheDocument()

    expect(screen.getByText(/Test WS/i)).toBeInTheDocument()
  })

  it('dovrebbe eliminare workspace e navigare alla lista', async () => {
    mockExecute.mockResolvedValueOnce(undefined)

    render(<DeleteWorkspaceButton workspaceId="1" workspaceName="Test WS" />)

    // 1. apri dialog
    fireEvent.click(screen.getByRole('button', { name: 'Elimina' }))

    const dialog = await screen.findByRole('alertdialog')

    // 2. click conferma (dentro dialog)
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Elimina',
    })

    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith('1')
    })

    await waitFor(() => {
      expect(mockInvalidate).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/workspaces',
      })
    })
  })
})
