import { useSearch } from '@tanstack/react-router'
import { signInWithRedirect } from 'aws-amplify/auth'
import { configureAmplify } from '../services/cognito'

export function LoginPage() {
  const search = useSearch({ from: '/login' })
/*
  const handleLogin = async () => {
    await signInWithRedirect() // Cognito Hosted UI
  }*/
 const login = async () => {
    /*console.log('before configure')
    configureAmplify()
    console.log('after configure')*/
    await signInWithRedirect()
  }

  return (
    <div>
      <h1>Login</h1>

      <button onClick={login}>
        Accedi con Cognito
      </button>
    </div>
  )
}