type RepositoryCardProps = {
  name: string
  ownerName: string
  dateScan?: string
  documentationScore?: number
  codeCoverage?: number
  cvss?: number
}

function ScoreBar({ label, value }: { label: string; value?: number }) {
  const percentage = value ?? 0
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
        <span>{value !== undefined ? `${value}%` : '—'}</span>
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

function CvssBadge({ cvss }: { cvss?: number }) {
  if (cvss === undefined) return <span className="text-xs opacity-50">—</span>

  const color =
    cvss <= 3.9
      ? 'bg-green-100 text-green-700'
      : cvss <= 6.9
        ? 'bg-yellow-100 text-yellow-700'
        : cvss <= 8.9
          ? 'bg-orange-100 text-orange-700'
          : 'bg-red-100 text-red-700'

  const label =
    cvss <= 3.9 ? 'Low' : cvss <= 6.9 ? 'Medium' : cvss <= 8.9 ? 'High' : 'Critical'

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {label} {cvss.toFixed(1)}
    </span>
  )
}

export default function RepositoryCard({
  name,
  ownerName,
  dateScan,
  documentationScore,
  codeCoverage,
  cvss,
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
          <p className="text-xs text-[var(--sea-ink)] opacity-60">{ownerName}</p>
          <h3 className="text-base font-semibold text-[var(--sea-ink)]">{name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-[var(--sea-ink)] opacity-50">CVSS</span>
          <CvssBadge cvss={cvss} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <ScoreBar label="Documentation" value={documentationScore} />
        <ScoreBar label="Code Coverage" value={codeCoverage} />
      </div>

      {formattedDate && (
        <p className="text-xs text-[var(--sea-ink)] opacity-50">
          Ultima scansione: {formattedDate}
        </p>
      )}
    </div>
  )
}
