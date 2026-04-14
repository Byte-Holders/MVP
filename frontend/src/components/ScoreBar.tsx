export function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 7 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-[var(--sea-ink)] opacity-70">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--chip-line)]">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  )
}
