import { Link } from '@tanstack/react-router'
import type { RepositoryInWorkspace } from '../types/repository'
import { useRemoveRepository } from '../hooks/useRemoveRepository'
import RepositoryCard from '../../../components/RepositoryCard'

interface Props {
  repository: RepositoryInWorkspace
  workspaceId: string
}

export function RepositoryItem({ repository, workspaceId }: Props) {
  const { mutate: remove, isPending } = useRemoveRepository(workspaceId)

  return (
    <div className="relative">
      <Link
        to="/workspaces/$workspaceId/repositories/$repositoryId"
        params={{ workspaceId, repositoryId: repository.repositoryId }}
        className="block"
      >
        <RepositoryCard
          name={repository.name}
          ownerName={repository.ownerName}
          dateScan={repository.dateScan}
          documentationScore={repository.documentationScore}
          codeCoverage={repository.codeCoverage}
          cvss={repository.cvss}
          isRemoving={isPending}
        />
      </Link>
      <button
        onClick={() => remove({ repositoryId: repository.repositoryId })}
        disabled={isPending}
        className="absolute right-4 top-4 rounded-lg border border-[var(--destructive)] px-3 py-1.5 text-xs font-medium text-[var(--destructive)] transition-opacity hover:opacity-70 disabled:opacity-40"
      >
        {isPending ? 'Rimozione...' : 'Rimuovi'}
      </button>
    </div>
  )
}
