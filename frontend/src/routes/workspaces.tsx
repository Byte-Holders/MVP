import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { WorkspacesPage } from '@/features/workspaceList/pages/Workspaces';

export const Route = createFileRoute('/workspaces')({
  component: () => (
    <ProtectedRoute>
      <WorkspacesPage />
    </ProtectedRoute>
  ),
});