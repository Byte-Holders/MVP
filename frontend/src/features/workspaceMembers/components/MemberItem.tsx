import type { WorkspaceMember } from '../types/workspaceMember'

type Props = {
  member: WorkspaceMember
  isRemoving: boolean
  onRemove: (userId: string) => void
}

export function MemberItem({ member, isRemoving, onRemove }: Props) {
  const initials = member.username.substring(0, 2).toUpperCase()

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--h-line)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--line)] text-[var(--sea-ink)] text-sm font-bold tracking-wider">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--sea-ink)]">{member.username}</p>
          <p className="text-xs text-[var(--sea-ink-soft)]">{member.role}</p>
        </div>
      </div>
      <button
        disabled={isRemoving}
        onClick={() => onRemove(member.userId)}
        className="rounded-lg border border-red-500/30 px-4 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
      >
        Rimuovi
      </button>
    </div>
  )
}
