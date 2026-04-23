import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { RepositoryList } from '../components/RepositoryList'

interface Props {
  workspaceId: string
}

export function RepositoriesPage({ workspaceId }: Props) {
  return (
    <ProtectedRoute>
      <main className="page-wrap py-10">
        <RepositoryList workspaceId={workspaceId} />
      </main>
    </ProtectedRoute>
  )
}
