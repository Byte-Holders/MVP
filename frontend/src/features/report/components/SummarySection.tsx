import type { ReportInfo } from '../types/report'

type Props = {
  summary: NonNullable<ReportInfo['summary']>
  metadata?: ReportInfo['metadata']
}

function ScoreRing({ mark }: { mark: number }) {
  const pct = (mark / 10) * 100
  const radius = 36
  const circ = 2 * Math.PI * radius
  const dash = (pct / 100) * circ
  const color =
    mark >= 7 ? '#4fb8b2' : mark >= 5 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle
        cx={48}
        cy={48}
        r={radius}
        fill="none"
        stroke="var(--chip-line)"
        strokeWidth={8}
      />
      <circle
        cx={48}
        cy={48}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
      <text
        x={48}
        y={48}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={700}
        fill="var(--sea-ink)"
      >
        {mark.toFixed(1)}
      </text>
    </svg>
  )
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 0) return null
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SummarySection({ summary, metadata }: Props) {
  const duration =
    metadata?.startScanTime && metadata?.endScanTime
      ? formatDuration(metadata.startScanTime, metadata.endScanTime)
      : null

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <div className="flex items-start gap-6">
        {/* Score ring */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <ScoreRing mark={summary.mark} />
          <span className="text-[10px] text-[var(--sea-ink)] opacity-50">
            Voto globale
          </span>
        </div>

        {/* Summary text + metadata */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <p className="text-sm leading-relaxed text-[var(--sea-ink)] opacity-80">
            {summary.summary}
          </p>

          {metadata && (
            <div className="flex flex-wrap gap-4 border-t border-[var(--chip-line)] pt-3">
              {metadata.startScanTime && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--sea-ink)] opacity-40">
                    Inizio scansione
                  </span>
                  <span className="text-xs text-[var(--sea-ink)] opacity-70">
                    {formatDate(metadata.startScanTime)}
                  </span>
                </div>
              )}
              {metadata.endScanTime && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--sea-ink)] opacity-40">
                    Fine scansione
                  </span>
                  <span className="text-xs text-[var(--sea-ink)] opacity-70">
                    {formatDate(metadata.endScanTime)}
                  </span>
                </div>
              )}
              {duration && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--sea-ink)] opacity-40">
                    Durata
                  </span>
                  <span className="text-xs font-semibold text-[var(--lagoon-deep)]">
                    {duration}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
