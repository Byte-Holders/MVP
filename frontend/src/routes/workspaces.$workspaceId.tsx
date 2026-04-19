import { createFileRoute } from '@tanstack/react-router'
import { WorkspacePage } from '@/features/workspaceList/pages/WorkspacePage'

export const Route = createFileRoute('/workspaces/$workspaceId')({
  component: function WorkspaceLayout() {
    const { workspaceId } = Route.useParams()
    return <WorkspacePage workspaceId={workspaceId} />
  },
})
