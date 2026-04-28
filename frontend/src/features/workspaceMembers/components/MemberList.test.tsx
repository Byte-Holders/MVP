import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemberList } from './MemberList'
import type { WorkspaceMember } from '../types/workspaceMember'

const makeMember = (
  overrides: Partial<WorkspaceMember> = {},
): WorkspaceMember => ({
  userId: 'user-1',
  username: 'mario_rossi',
  role: 'Developer',
  ...overrides,
})

describe('MemberList', () => {
  // --- lista vuota ---

  it('mostra "Nessun membro nel workspace" se la lista è vuota', () => {
    render(<MemberList members={[]} isRemoving={false} onRemove={vi.fn()} />)
    expect(screen.getByText('Nessun membro nel workspace')).toBeInTheDocument()
  })

  it('non mostra MemberItem se la lista è vuota', () => {
    render(<MemberList members={[]} isRemoving={false} onRemove={vi.fn()} />)
    expect(
      screen.queryByRole('button', { name: 'Rimuovi' }),
    ).not.toBeInTheDocument()
  })

  // --- lista con membri ---

  it('renderizza un MemberItem per ogni membro nella lista', () => {
    const members = [
      makeMember({ userId: 'u-1', username: 'mario_rossi' }),
      makeMember({ userId: 'u-2', username: 'alice_dev' }),
      makeMember({
        userId: 'u-3',
        username: 'bob_pm',
        role: 'Project Manager',
      }),
    ]

    render(
      <MemberList members={members} isRemoving={false} onRemove={vi.fn()} />,
    )

    expect(screen.getByText('mario_rossi')).toBeInTheDocument()
    expect(screen.getByText('alice_dev')).toBeInTheDocument()
    expect(screen.getByText('bob_pm')).toBeInTheDocument()
  })

  it('mostra un pulsante Rimuovi per ogni membro', () => {
    const members = [
      makeMember({ userId: 'u-1' }),
      makeMember({ userId: 'u-2', username: 'alice_dev' }),
    ]

    render(
      <MemberList members={members} isRemoving={false} onRemove={vi.fn()} />,
    )

    const buttons = screen.getAllByRole('button', { name: 'Rimuovi' })
    expect(buttons).toHaveLength(2)
  })

  // --- propagazione onRemove ---

  it('chiama onRemove con userId corretto al click del pulsante del primo membro', () => {
    const onRemove = vi.fn()
    const members = [
      makeMember({ userId: 'u-1', username: 'mario_rossi' }),
      makeMember({ userId: 'u-2', username: 'alice_dev' }),
    ]

    render(
      <MemberList members={members} isRemoving={false} onRemove={onRemove} />,
    )

    // Il primo pulsante Rimuovi corrisponde al primo membro
    const buttons = screen.getAllByRole('button', { name: 'Rimuovi' })
    fireEvent.click(buttons[0])

    expect(onRemove).toHaveBeenCalledWith('u-1')
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('chiama onRemove con userId corretto al click del pulsante del secondo membro', () => {
    const onRemove = vi.fn()
    const members = [
      makeMember({ userId: 'u-1', username: 'mario_rossi' }),
      makeMember({ userId: 'u-2', username: 'alice_dev' }),
    ]

    render(
      <MemberList members={members} isRemoving={false} onRemove={onRemove} />,
    )

    const buttons = screen.getAllByRole('button', { name: 'Rimuovi' })
    fireEvent.click(buttons[1])

    expect(onRemove).toHaveBeenCalledWith('u-2')
  })

  // --- propagazione isRemoving ---

  it('disabilita tutti i pulsanti Rimuovi quando isRemoving = true', () => {
    const members = [
      makeMember({ userId: 'u-1' }),
      makeMember({ userId: 'u-2', username: 'alice_dev' }),
    ]

    render(
      <MemberList members={members} isRemoving={true} onRemove={vi.fn()} />,
    )

    const buttons = screen.getAllByRole('button', { name: 'Rimuovi' })
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('non mostra il messaggio vuoto quando ci sono membri', () => {
    render(
      <MemberList
        members={[makeMember()]}
        isRemoving={false}
        onRemove={vi.fn()}
      />,
    )
    expect(
      screen.queryByText('Nessun membro nel workspace'),
    ).not.toBeInTheDocument()
  })
})
