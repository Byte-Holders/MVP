import type { WorkspaceMember } from '../types/workspaceMember'
import { MemberItem } from './MemberItem'

type Props = {
  members: WorkspaceMember[]
  isRemoving: boolean
  onRemove: (userId: string) => void
}

export function MemberList({ members, isRemoving, onRemove }: Props) {
  if (members.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--sea-ink-soft)]">
        Nessun membro nel workspace
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((member) => (
        <MemberItem
          key={member.userId}
          member={member}
          isRemoving={isRemoving}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
