import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/pages/Login'

export const Route = createFileRoute('/login')({
    validateSearch: (search) => {
    return {
      redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    }
  },
  component: LoginPage,
})