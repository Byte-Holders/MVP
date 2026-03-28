/*import { redirect } from '@tanstack/react-router'
import { getCurrentUser } from 'aws-amplify/auth'

export function requireAuth({ location }: { location: any }) {
  const user = getCurrentUser()

  if (!user) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    })
  }
}*/
import { useEffect, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { getCurrentUser } from 'aws-amplify/auth'
import { configureAmplify } from '../services/cognito'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const router = useRouter()

  const [status, setStatus] = useState<'checking' | 'ok' | 'no'>('checking')

  useEffect(() => {
    console.log('in use effect requiredAuth')
    configureAmplify()
    console.log('after configure')

    async function check() {
      try {
        await getCurrentUser()
        setStatus('ok')
      } catch {
        setStatus('no')
        const path = router.state.location.pathname

        navigate({
          to: '/login',
          search: { redirect: path },
          replace: true,
        })
      }
    }

    check()
  }, [])
  // 🟢 loggato → mostra app
  return <>{children}</>
}