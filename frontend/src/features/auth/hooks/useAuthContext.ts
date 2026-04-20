import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
