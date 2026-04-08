import React from 'react'
import { useAcceptInvite } from '../hooks/AcceptButtonCallback'
import { useRejectInvite } from '../hooks/RejectButtonCallback'

interface Props {
  invite: any
  onAction: () => void
}

export const InviteElement: React.FC<Props> = ({ invite, onAction }) => {
  const { handleAccept } = useAcceptInvite(onAction)
  const { handleReject } = useRejectInvite(onAction)

  const workspaceInitials = invite.workspaceId
    ? invite.workspaceId.substring(0, 2).toUpperCase()
    : 'WS'

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-[var(--h-line)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:border-[var(--sea-ink-soft)]/30 hover:shadow-md">
      {/* Sezione Info */}
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--line)] text-[var(--sea-ink)] font-bold tracking-wider">
          {workspaceInitials}
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-0.5">
            <p className="text-sm font-medium text-[var(--sea-ink-soft)]">
              ID del workspace a cui sei invitato:
            </p>
            <h3 className="text-lg font-semibold text-[var(--sea-ink)]">
              {invite.workspaceId}
            </h3>
          </div>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Sei stato invitato da:{' '}
            <span className="font-medium text-[var(--sea-ink)]">
              {invite.senderUsername}
            </span>
          </p>
        </div>
      </div>

      {/* Sezione Bottoni */}
      <div className="flex w-full sm:w-auto gap-3">
        <button
          onClick={() =>
            handleReject(invite.recipientUsername, invite.workspaceId)
          }
          className="flex-1 sm:flex-none rounded-lg border border-red-500/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600"
        >
          Rifiuta
        </button>
        <button
          onClick={() =>
            handleAccept(invite.recipientUsername, invite.workspaceId)
          }
          className="flex-1 sm:flex-none rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
        >
          Accetta
        </button>
      </div>
    </div>
  )
}
