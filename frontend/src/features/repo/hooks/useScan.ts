import { useMutation } from '@tanstack/react-query'
import { fetchAuthSession } from 'aws-amplify/auth'
import { requestScan, stopScan, type StartScanInfo } from '../model/scan'

export function useScan(payload: StartScanInfo) {
  const { mutate, isPending, isSuccess, error, reset, data } = useMutation({
    mutationFn: async () => {
      const session = await fetchAuthSession()
      const token = session.tokens?.accessToken?.toString()
      if (!token) throw new Error('Utente non autenticato')
      return await requestScan(payload, token)
    },
  })

  return {
    triggerScan: mutate,
    scanId: data,
    isPending,
    isSuccess,
    error,
    reset,
  }
}

export function useStopScan() {
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async (scanId: string) => {
      const session = await fetchAuthSession()
      const token = session.tokens?.accessToken?.toString()
      if (!token) throw new Error('Utente non autenticato')
      await stopScan(scanId, token)
    },
  })

  return {
    triggerStop: mutate,
    isStopping: isPending,
    stopError: error,
    resetStop: reset,
  }
}
