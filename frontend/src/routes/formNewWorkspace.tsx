import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { NewWorkspaceDialog } from '@/features/workspaceList/pages/FormNewWorkspace'

export const Route = createFileRoute('/formNewWorkspace')({
  component: () => (
    <ProtectedRoute>
      <NewWorkspaceDialog />
    </ProtectedRoute>
  ),
})