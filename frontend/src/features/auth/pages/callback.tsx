import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { getCurrentUser } from 'aws-amplify/auth'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/callback' })

  useEffect(() => {
    async function handle() {
      const user = await getCurrentUser()

      if (user) {
        navigate({
          to: search.redirect || '/',
          replace: true,
        })
      }
    }

    handle()
  }, [])

  return <p>Logging in...</p>
}