import { createFileRoute } from '@tanstack/react-router'
import { WorkspacesIndexPage } from '@/features/workspaceList/pages/WorkspacesIndexPage'

export const Route = createFileRoute('/workspaces/')({
  component: WorkspacesIndexPage,
})
