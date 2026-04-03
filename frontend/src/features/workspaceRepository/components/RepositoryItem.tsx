import type { RepositoryInWorkspace } from '../types/repository'
import { useRemoveRepository } from '../hooks/useRemoveRepository'

interface Props {
  repository: RepositoryInWorkspace
  workspaceId: string
}

export function RepositoryItem({ repository, workspaceId }: Props) {
  const { mutate: remove, isPending } = useRemoveRepository(workspaceId)

  return (
    <div className="feature-card p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-sm">{repository.name}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{repository.owner}</p>
      </div>
      <button
        onClick={() => remove({ repoId: repository.repoId })}
        disabled={isPending}
        className="rounded-lg border border-[var(--destructive)] px-3 py-1.5 text-xs font-medium text-[var(--destructive)] transition-opacity hover:opacity-70 disabled:opacity-40"
      >
        {isPending ? 'Rimozione...' : 'Rimuovi'}
      </button>
    </div>
  )
}
