import { createFileRoute } from '@tanstack/react-router'
import { AuthCallbackPage } from '@/features/auth/pages/callback'

export const Route = createFileRoute('/callback')({
    validateSearch: (search) => {
    return {
      redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    }
  },
  component: AuthCallbackPage,
})