import { createFileRoute } from '@tanstack/react-router'
import { ReportPage } from '@/features/report/pages/ReportPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

export const Route = createFileRoute(
  '/workspaces/$workspaceId/repositories/$repositoryId',
)({
  component: function ReportRoute() {
    const { workspaceId, repositoryId } = Route.useParams()
    return (
      <ProtectedRoute>
        <ReportPage workspaceId={workspaceId} repositoryId={repositoryId} />
      </ProtectedRoute>
    )
  },
})
