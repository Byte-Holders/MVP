import { createFileRoute } from '@tanstack/react-router'
import { RepositoriesPage } from '@/features/workspaceRepository/pages/RepositoriesPage'

export const Route = createFileRoute('/workspaces/$workspaceId/repositories')({
  component: function RepositoriesRoute() {
    const { workspaceId } = Route.useParams()
    return <RepositoriesPage workspaceId={workspaceId} />
  },
})
