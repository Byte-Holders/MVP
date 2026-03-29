import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RepositoryPage} from '@/features/repo/Repository';

export const Route = createFileRoute('/repository')({
  component: () => (
    <ProtectedRoute>
      <RepositoryPage />
    </ProtectedRoute>
  ),
});