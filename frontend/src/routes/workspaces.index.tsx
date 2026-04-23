import { createFileRoute } from '@tanstack/react-router'
import { WorkspacesPage } from '@/features/workspaceList/pages/WorkspacesPage'

export const Route = createFileRoute('/workspaces/')({
  component: WorkspacesPage,
})
