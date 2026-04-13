import { useScan, useStopScan } from '../hooks/useScan'

interface ScanButtonProps {
  workspaceId: string
  repositoryId: string
  branch: string
}

export function ScanButton({
  workspaceId,
  repositoryId,
  branch,
}: ScanButtonProps) {
  const { triggerScan, scanId, isPending, isSuccess, error, reset } = useScan({
    workspaceId,
    repositoryId,
    branch,
  })
  const { triggerStop, isStopping, stopError, resetStop } = useStopScan()

  const scanRunning = isSuccess && !!scanId

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
            triggerStop(scanId, {
              onSuccess: () => {
                resetStop()
                reset()
              },
            })
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
