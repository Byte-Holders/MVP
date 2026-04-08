import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { RepositoryList } from '@/features/workspaceRepository/components/RepositoryList'

export const Route = createFileRoute('/workspaces/$workspaceId/repositories')({
  component: RepositoriesPage,
})

function RepositoriesPage() {
  const { workspaceId } = Route.useParams()

  return (
    <ProtectedRoute>
      <main className="page-wrap py-10">
        <RepositoryList workspaceId={workspaceId} />
      </main>
    </ProtectedRoute>
  )
}
