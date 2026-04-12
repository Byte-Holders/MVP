import type { Invite } from '../types'

type Props = {
  invite: Invite
  isPending: boolean
  onAccept: (membershipId: string) => void
  onReject: (membershipId: string) => void
}

export function InviteItem({ invite, isPending, onAccept, onReject }: Props) {
  const initials = invite.workspaceName.substring(0, 2).toUpperCase()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-[var(--h-line)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:border-[var(--sea-ink-soft)]/30 hover:shadow-md">
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--line)] text-[var(--sea-ink)] font-bold tracking-wider">
          {initials}
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-0.5">
            <p className="text-sm font-medium text-[var(--sea-ink-soft)]">Workspace:</p>
            <h3 className="text-lg font-semibold text-[var(--sea-ink)]">{invite.workspaceName}</h3>
          </div>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Invitato da:{' '}
            <span className="font-medium text-[var(--sea-ink)]">{invite.senderUsername}</span>
          </p>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Ruolo:{' '}
            <span className="font-medium text-[var(--sea-ink)]">{invite.recipientRole}</span>
          </p>
        </div>
      </div>

      <div className="flex w-full sm:w-auto gap-3">
        <button
          disabled={isPending}
          onClick={() => onReject(invite._id)}
          className="flex-1 sm:flex-none rounded-lg border border-red-500/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
        >
          Rifiuta
        </button>
        <button
          disabled={isPending}
          onClick={() => onAccept(invite._id)}
          className="flex-1 sm:flex-none rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          Accetta
        </button>
      </div>
    </div>
  )
}
