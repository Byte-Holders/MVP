import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useScan, useScanStatus, useStopScan } from '../hooks/useScan'

const TERMINAL_STATES = ['completed', 'stopped', 'error']

interface ScanButtonProps {
  workspaceId: string
  repositoryId: string
  branch: string
  onCompleted?: () => void
  onScanActiveChange?: (active: boolean) => void
}

export function ScanButton({
  workspaceId,
  repositoryId,
  branch,
  onCompleted,
  onScanActiveChange,
}: ScanButtonProps) {
  const { triggerScan, scanId, isPending, isSuccess, error, reset } = useScan({
    workspaceId,
    repositoryId,
    branch,
  })
  const { triggerStop, isStopping, stopError } = useStopScan(() => {
    queryClient.removeQueries({ queryKey: ['scanStatus', scanId] })
    reset()
  })
  const { scanStatus } = useScanStatus(scanId)
  const queryClient = useQueryClient()
  const completedRef = useRef(false)

  const scanRunning = isSuccess && !!scanId

  // Reset the guard whenever a new scan starts
  useEffect(() => {
    if (isSuccess && scanId) {
      completedRef.current = false
    }
  }, [isSuccess, scanId])

  function completeScan(status: string) {
    if (completedRef.current) return
    completedRef.current = true

    if (status === 'completed') {
      onCompleted?.()
    }
    queryClient.removeQueries({ queryKey: ['scanStatus', scanId] })
    reset()
  }

  useEffect(() => {
    onScanActiveChange?.(scanRunning)
  }, [scanRunning, onScanActiveChange])

  // Primary path: scan status reaches a terminal state
  useEffect(() => {
    if (!scanStatus || !TERMINAL_STATES.includes(scanStatus)) return
    completeScan(scanStatus)
  }, [scanStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback: after 90s start polling the report every 8s.
  // If the report appears while the scan is running, mark as completed.
  useEffect(() => {
    if (!scanRunning) return

    let interval: ReturnType<typeof setInterval>

    const timeout = setTimeout(() => {
      void queryClient.refetchQueries({ queryKey: ['report', repositoryId, branch], type: 'active' })
      interval = setInterval(() => {
        void queryClient.refetchQueries({ queryKey: ['report', repositoryId, branch], type: 'active' })
      }, 8_000)
    }, 90_000)

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.query.queryKey[0] === 'report' &&
        event.query.queryKey[1] === repositoryId &&
        event.query.queryKey[2] === branch &&
        event.query.state.status === 'success'
      ) {
        completeScan('completed')
      }
    })

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
      unsubscribe()
    }
  }, [scanRunning, repositoryId, branch]) // eslint-disable-line react-hooks/exhaustive-deps

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
          onClick={() => triggerStop(scanId)}
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
