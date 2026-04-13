import { useMutation } from '@tanstack/react-query'
import { fetchAuthSession } from 'aws-amplify/auth'
import { requestScan, type StartScanInfo } from '../model/scan'

export function useScan(payload: StartScanInfo) {
  const { mutate, isPending, isSuccess, error, reset } = useMutation({
    mutationFn: async () => {
      const session = await fetchAuthSession()
      const token = session.tokens?.accessToken?.toString()
      if (!token) throw new Error('Utente non autenticato')
      await requestScan(payload, token)
    },
  })

  return {
    triggerScan: mutate,
    isPending,
    isSuccess,
    error,
    reset,
  }
}
