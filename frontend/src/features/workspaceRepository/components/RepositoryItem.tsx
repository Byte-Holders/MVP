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
    <RepositoryCard
      name={repository.name}
      ownerName={repository.ownerName}
      dateScan={repository.dateScan}
      documentationScore={repository.documentationScore}
      codeCoverage={repository.codeCoverage}
      cvss={repository.cvss}
      onRemove={() => remove({ repositoryId: repository.repositoryId })}
      isRemoving={isPending}
    />
  )
}
