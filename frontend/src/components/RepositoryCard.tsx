type RepositoryCardProps = {
  name: string
  ownerName: string
  dateScan?: string
  documentationScore?: number
  codeCoverage?: number
  cvss?: number
  onRemove?: () => void
  isRemoving?: boolean
}

function ScoreBar({
  label,
  value,
  max = 100,
  unit = '%',
}: {
  label: string
  value?: number
  max?: number
  unit?: string
}) {
  const percentage = value !== undefined ? (value / max) * 100 : 0
  const color =
    percentage >= 75
      ? 'bg-green-500'
      : percentage >= 50
        ? 'bg-yellow-400'
        : 'bg-red-500'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-[var(--sea-ink)] opacity-70">
        <span>{label}</span>
        <span>{value !== undefined ? `${value}${unit}` : '—'}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--chip-line)]">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}


export default function RepositoryCard({
  name,
  ownerName,
  dateScan,
  documentationScore,
  codeCoverage,
  cvss,
  onRemove,
  isRemoving,
}: RepositoryCardProps) {
  const formattedDate = dateScan
    ? new Date(dateScan).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5 shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-[var(--sea-ink)] opacity-60">
            {ownerName}
          </p>
          <h3 className="text-base font-semibold text-[var(--sea-ink)]">
            {name}
          </h3>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            disabled={isRemoving}
            className="rounded-lg border border-[var(--destructive)] px-3 py-1.5 text-xs font-medium text-[var(--destructive)] transition-opacity hover:opacity-70 disabled:opacity-40"
          >
            {isRemoving ? 'Rimozione...' : 'Rimuovi'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <ScoreBar label="Documentation" value={documentationScore} max={10} unit="/10" />
        <ScoreBar label="Code Coverage" value={codeCoverage} />
        <ScoreBar label="CVSS" value={cvss} max={10} unit="/10" />
      </div>

      {formattedDate && (
        <p className="text-xs text-[var(--sea-ink)] opacity-50">
          Ultima scansione: {formattedDate}
        </p>
      )}
    </div>
  )
}
