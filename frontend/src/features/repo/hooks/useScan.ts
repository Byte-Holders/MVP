import { fetchAuthSession } from 'aws-amplify/auth'
import { requestScan, type StartScanInfo } from '../model/scan'

export function useScan(payload: StartScanInfo) {
  const triggerScan = async () => {
    try {
      const session = await fetchAuthSession()
      const token = session.tokens?.accessToken?.toString()
      // if (!token) throw new Error('Errore di autenticazione') TODO verificare guardia
      if (!token) console.error('Errore di autenticazione')

      await requestScan(payload, token)
    } catch (err: unknown) {
      console.log(`Errore: ${(err as Error).message}`)
    }
  }

  return { triggerScan }
}
