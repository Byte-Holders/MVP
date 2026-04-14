import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { WorkspacesPage } from './WorkspacesPage'

export function WorkspacesIndexPage() {
  return (
    <ProtectedRoute>
      <WorkspacesPage />
    </ProtectedRoute>
  )
}
