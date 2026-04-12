import { WORKSPACE_ROLES, type WorkspaceRole } from '../types/workspaceMember'

type Props = {
  username: string
  role: WorkspaceRole
  isPending: boolean
  error: Error | null
  isSuccess: boolean
  onUsernameChange: (v: string) => void
  onRoleChange: (v: WorkspaceRole) => void
  onSubmit: (e: React.FormEvent) => void
}

export function InviteForm({
  username,
  role,
  isPending,
  error,
  isSuccess,
  onUsernameChange,
  onRoleChange,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[var(--sea-ink)]">Invita un utente</h2>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-[var(--sea-ink-soft)]">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="es. mario_rossi"
            className="rounded-lg border border-[var(--h-line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--sea-ink-soft)]">Ruolo</label>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as WorkspaceRole)}
            className="rounded-lg border border-[var(--h-line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {WORKSPACE_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending || !username.trim()}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Invio...' : 'Invita'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error.message}</p>
      )}
      {isSuccess && (
        <p className="text-xs text-green-600">Invito inviato con successo.</p>
      )}
    </form>
  )
}
