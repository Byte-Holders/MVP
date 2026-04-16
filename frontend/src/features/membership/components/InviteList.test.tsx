import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { InviteList } from './InviteList'
import type { Invite } from '../types'

const makeInvite = (overrides: Partial<Invite> = {}): Invite => ({
  _id: 'inv-1',
  workspaceName: 'WorkspaceA',
  senderUsername: 'alice',
  recipientUsername: 'bob',
  recipientRole: 'developer',
  status: 'PENDING',
  ...overrides,
})

describe('InviteList', () => {
  it('mostra il messaggio vuoto se non ci sono inviti', () => {
    render(<InviteList invites={[]} isPending={false} onAction={vi.fn()} />)
    expect(screen.getByText('Nessun invito pendente')).toBeInTheDocument()
  })

  it('mostra un InviteItem per ogni invito', () => {
    const invites = [
      makeInvite({ _id: 'inv-1', workspaceName: 'WorkspaceA' }),
      makeInvite({ _id: 'inv-2', workspaceName: 'WorkspaceB' }),
    ]
    render(
      <InviteList invites={invites} isPending={false} onAction={vi.fn()} />,
    )
    expect(screen.getByText('WorkspaceA')).toBeInTheDocument()
    expect(screen.getByText('WorkspaceB')).toBeInTheDocument()
  })

  it('chiama onAction con Accept quando si clicca Accetta', () => {
    const onAction = vi.fn()
    render(
      <InviteList
        invites={[makeInvite()]}
        isPending={false}
        onAction={onAction}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Accetta' }))
    expect(onAction).toHaveBeenCalledWith('inv-1', 'Accept')
  })

  it('chiama onAction con Reject quando si clicca Rifiuta', () => {
    const onAction = vi.fn()
    render(
      <InviteList
        invites={[makeInvite()]}
        isPending={false}
        onAction={onAction}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Rifiuta' }))
    expect(onAction).toHaveBeenCalledWith('inv-1', 'Reject')
  })
})
