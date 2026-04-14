import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useGetRepositories } from '../hooks/useGetRepositories'
import { AddRepositoryForm } from './AddRepositoryForm'
import { RepositoryItem } from './RepositoryItem'

interface Props {
  workspaceId: string
}

export function RepositoryList({ workspaceId }: Props) {
  const [search, setSearch] = useState('')
  const {
    data: repositories,
    isLoading,
    error,
  } = useGetRepositories(workspaceId, search || undefined)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="display-title text-xl">Repository</h2>
        <Link
          to="/workspaces/$workspaceId/members"
          params={{ workspaceId }}
          className="rounded-lg border border-[var(--h-line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-[var(--chip-line)]"
        >
          Membri
        </Link>
      </div>

      <AddRepositoryForm workspaceId={workspaceId} />

      <input
        type="text"
        placeholder="Cerca per nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />

      {isLoading && (
        <p className="text-sm text-[var(--muted-foreground)]">Caricamento...</p>
      )}

      {error && (
        <p className="text-sm text-[var(--destructive)]">{error.message}</p>
      )}

      {repositories && repositories.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">
          Nessun repository aggiunto.
        </p>
      )}

      {repositories && repositories.length > 0 && (
        <div className="flex flex-col gap-3">
          {repositories.map((repo) => (
            <RepositoryItem
              key={repo.repositoryId}
              repository={repo}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
