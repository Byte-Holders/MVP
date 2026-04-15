import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ReportPage } from '@/features/report/pages/ReportPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

const searchSchema = z.object({
  ownerName: z.string().catch(''),
  name: z.string().catch(''),
})

export const Route = createFileRoute(
  '/workspaces/$workspaceId/repositories/$repositoryId',
)({
  validateSearch: searchSchema,
  component: function ReportRoute() {
    const { workspaceId, repositoryId } = Route.useParams()
    const { ownerName, name } = Route.useSearch()
    return (
      <ProtectedRoute>
        <ReportPage
          workspaceId={workspaceId}
          repositoryId={repositoryId}
          ownerName={ownerName}
          name={name}
        />
      </ProtectedRoute>
    )
  },
})
