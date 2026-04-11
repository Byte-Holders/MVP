type Props = {
  branches: string[]
  isLoading: boolean
  selectedBranch: string
  onChange: (branch: string) => void
}

export function BranchSelector({ branches, isLoading, selectedBranch, onChange }: Props) {
  if (isLoading) {
    return <div className="h-8 w-32 animate-pulse rounded-lg bg-[var(--chip-line)]" />
  }

  return (
    <select
      id="branch-select"
      value={selectedBranch}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs text-[var(--sea-ink)] focus:outline-none"
    >
      {branches.map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
    </select>
  )
}
