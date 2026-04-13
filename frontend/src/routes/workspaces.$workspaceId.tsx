import { createFileRoute, Outlet } from '@tanstack/react-router'
import { WorkspaceHeader } from '@/features/workspaceList/components/WorkspaceHeader'

export const Route = createFileRoute('/workspaces/$workspaceId')({
  component: function WorkspaceLayout() {
    const { workspaceId } = Route.useParams()

    return (
      <div className="flex flex-col min-h-[calc(100vh-72px)]">
        <WorkspaceHeader workspaceId={workspaceId} />
        <Outlet />
      </div>
    )
  },
})
