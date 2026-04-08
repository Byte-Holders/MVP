import { createFileRoute } from '@tanstack/react-router'
import { InvitePage } from '@/features/membership/pages/InvitePage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

export const Route = createFileRoute('/membership')({
  //TODO: aggiungere un wrapper ProtectedRoute per proteggere la rotta
  //component: InvitePage,
  component: () => (
    <ProtectedRoute>
      <InvitePage />
    </ProtectedRoute>
  ),
})
