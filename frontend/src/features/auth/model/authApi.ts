import {
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession,
  signInWithRedirect,
  signOut,
} from 'aws-amplify/auth'

export async function fetchCurrentUser() {
  return amplifyGetCurrentUser()
}

export async function fetchSession() {
  return fetchAuthSession()
}

export async function signIn(redirectUrl?: string) {
  if (redirectUrl) sessionStorage.setItem('auth_redirect', redirectUrl)
  return signInWithRedirect()
}

export async function logOut() {
  return signOut()
}
