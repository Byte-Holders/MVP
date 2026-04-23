import type { Invite, InviteAction } from '../types'
import { InviteItem } from './InviteItem'

type Props = {
  invites: Invite[]
  isPending: boolean
  onAction: (membershipId: string, action: InviteAction) => void
}

export function InviteList({ invites, isPending, onAction }: Props) {
  if (invites.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--sea-ink-soft)]">
        Nessun invito pendente
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {invites.map((invite) => (
        <InviteItem
          key={invite._id}
          invite={invite}
          isPending={isPending}
          onAccept={(id) => onAction(id, 'Accept')}
          onReject={(id) => onAction(id, 'Reject')}
        />
      ))}
    </div>
  )
}
