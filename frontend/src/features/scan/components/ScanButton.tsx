import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useScan, useScanStatus, useStopScan } from '../hooks/useScan'

const TERMINAL_STATES = ['completed', 'stopped', 'error']

type TerminalStatus = 'completed' | 'stopped' | 'error' | null

interface ScanButtonProps {
  workspaceId: string
  repositoryId: string
  branch: string
  onCompleted?: () => void
}

export function ScanButton({
  workspaceId,
  repositoryId,
  branch,
  onCompleted,
}: ScanButtonProps) {
  const { triggerScan, scanId, isPending, isSuccess, error, reset } = useScan({
    workspaceId,
    repositoryId,
    branch,
  })
  const { triggerStop, isStopping, stopError } = useStopScan()
  const { scanStatus } = useScanStatus(scanId)
  const queryClient = useQueryClient()
  const [terminalStatus, setTerminalStatus] = useState<TerminalStatus>(null)

  useEffect(() => {
    if (!scanStatus || !TERMINAL_STATES.includes(scanStatus)) return
    setTerminalStatus(scanStatus as TerminalStatus)
    if (scanStatus === 'completed') {
      void queryClient.invalidateQueries({
        queryKey: ['report', repositoryId, branch],
      })
      onCompleted?.()
    }
    queryClient.removeQueries({ queryKey: ['scanStatus', scanId] })
    reset()
  }, [scanStatus, onCompleted, reset, queryClient, scanId, repositoryId, branch])

  const scanRunning = isSuccess && !!scanId

  function handleNewScan() {
    setTerminalStatus(null)
    reset()
    triggerScan()
  }

  if (terminalStatus) {
    const config = {
      completed: {
        label: 'Scansione completata',
        className:
          'rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-500',
      },
      stopped: {
        label: 'Scansione fermata',
        className:
          'rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-yellow-400',
      },
      error: {
        label: 'Scansione fallita',
        className:
          'rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500',
      },
    }[terminalStatus]

    return (
      <div className="flex flex-col items-end gap-1">
        <button onClick={handleNewScan} className={config.className}>
          {config.label} — Rilancia
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {!scanRunning ? (
        <button
          onClick={() => {
            reset()
            triggerScan()
          }}
          disabled={isPending || !branch}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Avvio...' : 'Lancia scansione'}
        </button>
      ) : (
        <button
          onClick={() => {
            triggerStop(scanId)
          }}
          disabled={isStopping}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500 disabled:opacity-50"
        >
          {isStopping ? 'Arresto...' : 'Ferma scansione'}
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error.message}</p>}
      {stopError && <p className="text-xs text-red-500">{stopError.message}</p>}
    </div>
  )
}
