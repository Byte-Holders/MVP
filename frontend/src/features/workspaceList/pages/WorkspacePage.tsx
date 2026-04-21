import { Outlet } from '@tanstack/react-router'
import { WorkspaceHeader } from '../components/WorkspaceHeader'

interface Props {
  workspaceId: string
}

export function WorkspacePage({ workspaceId }: Props) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-72px)]">
      <WorkspaceHeader workspaceId={workspaceId} />
      <Outlet />
    </div>
  )
}
