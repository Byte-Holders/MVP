import { Link } from '@tanstack/react-router'
import { useGetWorkspace } from '../hooks/useGetWorkspace'
import { useGetMembers } from '../../workspaceMembers/hooks/useGetMembers'
import { useGetRepositories } from '../../workspaceRepository/hooks/useGetRepositories'

type Props = {
  workspaceId: string
}

const ROLE_CONFIG: Record<string, { bg: string; text: string; border: string }> =
  {
    'project manager': {
      bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/20',
      text: 'text-fuchsia-600 dark:text-fuchsia-300',
      border: 'border-fuchsia-500/40',
    },
    'tech lead': {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-600 dark:text-purple-300',
      border: 'border-purple-500/40',
    },
    developer: {
      bg: 'bg-violet-500/10 dark:bg-violet-500/20',
      text: 'text-violet-600 dark:text-violet-300',
      border: 'border-violet-500/40',
    },
  }

const DEFAULT_ROLE_CONFIG = ROLE_CONFIG['developer']

function roleConfig(role: string) {
  return ROLE_CONFIG[role.toLowerCase()] ?? DEFAULT_ROLE_CONFIG
}

function formatRole(role: string) {
  return role.replace(/\b\w/g, (c) => c.toUpperCase())
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function WorkspaceHeader({ workspaceId }: Props) {
  const { data: workspace, isLoading } = useGetWorkspace(workspaceId)
  const { data: members } = useGetMembers(workspaceId)
  const { data: repositories } = useGetRepositories(workspaceId)

  if (isLoading) {
    return (
      <div className="page-wrap px-4 pb-0 pt-14">
        <div className="h-40 animate-pulse rounded-[2rem] bg-[var(--chip-line)]" />
      </div>
    )
  }

  if (!workspace) return null

  const cfg = roleConfig(workspace.role)

  return (
    <div className="page-wrap px-4 pb-0 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(124,92,231,0.28),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(90,61,191,0.16),transparent_66%)]" />

        <div className="relative flex items-start gap-5">
          {/* Avatar */}
          <Link
            to="/workspaces/$workspaceId/repositories"
            params={{ workspaceId }}
            className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lagoon)]/15 text-xl font-bold text-[var(--lagoon-deep)] select-none hover:bg-[var(--lagoon)]/25 transition-colors"
          >
            {initials(workspace.name)}
          </Link>

          {/* Info */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/workspaces/$workspaceId/repositories"
                params={{ workspaceId }}
                className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl truncate hover:text-[var(--lagoon-deep)] transition-colors"
              >
                {workspace.name}
              </Link>
              <span
                className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}
              >
                {formatRole(workspace.role)}
              </span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-1">
              {members !== undefined && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--sea-ink-soft)]">
                  <svg
                    className="h-3.5 w-3.5 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a4 4 0 00-5-3.5M9 20H4v-2a4 4 0 015-3.5m6-4a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>
                    <span className="font-semibold text-[var(--sea-ink)]">
                      {members.length}
                    </span>{' '}
                    membri
                  </span>
                </div>
              )}
              {repositories !== undefined && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--sea-ink-soft)]">
                  <svg
                    className="h-3.5 w-3.5 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7h18M3 12h18M3 17h18"
                    />
                  </svg>
                  <span>
                    <span className="font-semibold text-[var(--sea-ink)]">
                      {repositories.length}
                    </span>{' '}
                    repository
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
