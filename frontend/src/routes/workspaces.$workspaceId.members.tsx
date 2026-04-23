import { createFileRoute } from '@tanstack/react-router'
import { MembersPage } from '@/features/workspaceMembers/pages/MembersPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

export const Route = createFileRoute('/workspaces/$workspaceId/members')({
  component: function MembersRoute() {
    const { workspaceId } = Route.useParams()
    return (
      <ProtectedRoute>
        <MembersPage workspaceId={workspaceId} />
      </ProtectedRoute>
    )
  },
})
