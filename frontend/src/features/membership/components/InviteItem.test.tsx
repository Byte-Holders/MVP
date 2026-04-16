import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { InviteItem } from './InviteItem'
import type { Invite } from '../types'

const invite: Invite = {
  _id: 'inv-1',
  workspaceName: 'MyWorkspace',
  senderUsername: 'alice',
  recipientUsername: 'bob',
  recipientRole: 'developer',
  status: 'PENDING',
}

describe('InviteItem', () => {
  it('mostra il nome del workspace', () => {
    render(
      <InviteItem
        invite={invite}
        isPending={false}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )
    expect(screen.getByText('MyWorkspace')).toBeInTheDocument()
  })

  it('mostra le iniziali del workspace', () => {
    render(
      <InviteItem
        invite={invite}
        isPending={false}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )
    expect(screen.getByText('MY')).toBeInTheDocument()
  })

  it("mostra il mittente dell'invito", () => {
    render(
      <InviteItem
        invite={invite}
        isPending={false}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )
    expect(screen.getByText('alice')).toBeInTheDocument()
  })

  it('mostra il ruolo', () => {
    render(
      <InviteItem
        invite={invite}
        isPending={false}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )
    expect(screen.getByText('developer')).toBeInTheDocument()
  })

  it("chiama onAccept con l'id quando si clicca Accetta", () => {
    const onAccept = vi.fn()
    render(
      <InviteItem
        invite={invite}
        isPending={false}
        onAccept={onAccept}
        onReject={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Accetta' }))
    expect(onAccept).toHaveBeenCalledWith('inv-1')
  })

  it("chiama onReject con l'id quando si clicca Rifiuta", () => {
    const onReject = vi.fn()
    render(
      <InviteItem
        invite={invite}
        isPending={false}
        onAccept={vi.fn()}
        onReject={onReject}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Rifiuta' }))
    expect(onReject).toHaveBeenCalledWith('inv-1')
  })

  it('disabilita i pulsanti quando isPending è true', () => {
    render(
      <InviteItem
        invite={invite}
        isPending={true}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Accetta' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Rifiuta' })).toBeDisabled()
  })
})
