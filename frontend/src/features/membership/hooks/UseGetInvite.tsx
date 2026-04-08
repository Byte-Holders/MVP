import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../../auth/AuthContext'
import { fetchInvites } from '../model/GetInvite'
import type { Invite } from '../types'

export const useGetInvites = () => {
  const { user } = useAuthContext()
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)

  //TODO: togliere dopo la fase di debug
  // Per ora manteniamo il test, ma il polling funzionerà anche con i dati reali
  const currentUserId = user?.username || 'mario_rossi'

  const refresh = useCallback(async () => {
    try {
      // Nota: non resettiamo 'loading' a true qui per evitare il flash del
      // caricamento ogni volta che l'updater gira in background.
      const data = await fetchInvites(currentUserId)
      setInvites(data)
    } catch (err) {
      console.error("Errore durante l'aggiornamento automatico:", err)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    // Esegue il primo caricamento immediato
    refresh()

    // Imposta l'updater ogni 10 secondi (10000 ms)
    const intervalId = setInterval(() => {
      //console.log("Controllo nuovi inviti...");
      refresh()
    }, 10000)

    // Pulisce l'intervallo quando l'utente cambia pagina
    return () => clearInterval(intervalId)
  }, [refresh])

  return { invites, loading, refresh }
}
