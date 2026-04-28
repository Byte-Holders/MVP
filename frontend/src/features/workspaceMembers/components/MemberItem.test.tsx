import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemberItem } from './MemberItem'
import type { WorkspaceMember } from '../types/workspaceMember'

const mockMember: WorkspaceMember = {
  userId: 'user-1',
  username: 'mario_rossi',
  role: 'Developer',
}

describe('MemberItem', () => {
  // --- rendering ---

  it('mostra lo username del membro', () => {
    render(
      <MemberItem member={mockMember} isRemoving={false} onRemove={vi.fn()} />,
    )
    expect(screen.getByText('mario_rossi')).toBeInTheDocument()
  })

  it('mostra il ruolo del membro', () => {
    render(
      <MemberItem member={mockMember} isRemoving={false} onRemove={vi.fn()} />,
    )
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('mostra il pulsante Rimuovi', () => {
    render(
      <MemberItem member={mockMember} isRemoving={false} onRemove={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Rimuovi' })).toBeInTheDocument()
  })

  // --- stato pending ---

  it('disabilita il pulsante Rimuovi quando isRemoving = true', () => {
    render(
      <MemberItem member={mockMember} isRemoving={true} onRemove={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Rimuovi' })).toBeDisabled()
  })

  it('non chiama onRemove al click quando isRemoving = true (pulsante disabilitato)', () => {
    const onRemove = vi.fn()
    render(
      <MemberItem member={mockMember} isRemoving={true} onRemove={onRemove} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rimuovi' }))

    expect(onRemove).not.toHaveBeenCalled()
  })

  it('pulsante Rimuovi è abilitato quando isRemoving = false', () => {
    render(
      <MemberItem member={mockMember} isRemoving={false} onRemove={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Rimuovi' })).toBeEnabled()
  })
})
