import {
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession,
  signInWithRedirect,
  signOut,
  deleteUser,
} from 'aws-amplify/auth'
import { cognitoConfig } from '../../../lib/amplify'
import type { IAuthApi } from '../interfaces/model/IAuthApi'

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
  await signOut()
  const logoutUri = encodeURIComponent(window.location.origin + '/')
  window.location.href = `https://${cognitoConfig.domain}/logout?client_id=${cognitoConfig.clientId}&logout_uri=${logoutUri}`
}

export async function removeCurrentUser(): Promise<void> {
  await deleteUser()
}

export const authApi: IAuthApi = {
  fetchCurrentUser,
  fetchSession,
  signIn,
  logOut,
  removeCurrentUser,
}
