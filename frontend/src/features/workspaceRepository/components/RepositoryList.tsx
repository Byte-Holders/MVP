import { useGetRepositories } from '../hooks/useGetRepositories'
import { AddRepositoryForm } from './AddRepositoryForm'
import { RepositoryItem } from './RepositoryItem'

interface Props {
  workspaceId: string
}

export function RepositoryList({ workspaceId }: Props) {
  const {
    data: repositories,
    isLoading,
    error,
  } = useGetRepositories(workspaceId)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="display-title text-xl">Repository</h2>

      <AddRepositoryForm workspaceId={workspaceId} />

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
              key={repo.repoId}
              repository={repo}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
