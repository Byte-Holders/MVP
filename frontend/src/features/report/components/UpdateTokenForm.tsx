import { useState } from 'react'
import { useUpdateToken } from '#/features/workspaceRepository/hooks/useUpdateToken'

interface Props {
  workspaceId: string
  repositoryId: string
}

export function UpdateTokenForm({ workspaceId, repositoryId }: Props) {
  const [open, setOpen] = useState(false)
  const { token, setToken, isPending, clientError, serverError, handleSubmit: onSubmit } =
    useUpdateToken(workspaceId, repositoryId, () => setOpen(false))

  return (
    <div className="flex items-center gap-1.5">
      {/* Toggle button */}
      <button
        type="button"
        title="Aggiorna GitHub token"
        onClick={() => setOpen((v) => !v)}
        aria-label="Aggiorna GitHub token"
        aria-expanded={open}
        className={[
          'flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors',
          open
            ? 'border-[var(--lagoon)]/40 bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
            : 'border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]/30 hover:text-[var(--lagoon-deep)]',
        ].join(' ')}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M11.5 1a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm-5 3.5a5 5 0 1 1 2.121 4.072L5.5 11.5H4v1.5H2.5V14.5H1v-2.5l4.428-4.428A5.016 5.016 0 0 1 6.5 4.5zM11 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
        </svg>
      </button>

      {/* Inline form */}
      {open && (
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-1.5"
          style={{ animation: 'fade-slide-in 150ms ease both' }}
        >
          <div className="flex flex-col">
            <input
              type="password"
              placeholder="GitHub token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoFocus
              className="w-44 rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-1 text-[13px] text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 outline-none focus:border-[var(--lagoon)] focus:ring-1 focus:ring-[var(--lagoon)]/30"
            />
            {(clientError ?? serverError) && (
              <p className="mt-0.5 text-[11px] text-red-500 dark:text-red-400">
                {clientError ?? serverError?.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg border border-[var(--lagoon)]/35 bg-[var(--lagoon)]/10 px-3 py-1 text-[13px] font-semibold text-[var(--lagoon-deep)] transition-colors hover:bg-[var(--lagoon)]/20 disabled:opacity-50"
          >
            {isPending ? '...' : 'Salva'}
          </button>
        </form>
      )}

      <style>{`
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
