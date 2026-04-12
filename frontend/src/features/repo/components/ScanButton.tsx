import { useScan } from '../hooks/useScan'

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
  const { triggerScan, isPending, isSuccess, error, reset } = useScan({
    workspaceId,
    repositoryId,
    branch,
  })

  const disabled = isPending || !branch

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => {
          reset()
          triggerScan()
        }}
        disabled={disabled}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {isPending ? 'Avvio...' : 'Lancia scansione'}
      </button>

      {isSuccess && (
        <p className="text-xs text-green-600">
          Scansione avviata con successo.
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  )
}
