import { useGetWorkspace } from '../hooks/useGetWorkspace'

type Props = {
  workspaceId: string
}

export function WorkspaceHeader({ workspaceId }: Props) {
  const { data: workspace, isLoading } = useGetWorkspace(workspaceId)

  if (isLoading) {
    return (
      <div className="page-wrap px-4 pb-0 pt-14">
        <div className="h-40 animate-pulse rounded-[2rem] bg-[var(--chip-line)]" />
      </div>
    )
  }

  if (!workspace) return null

  return (
    <div className="page-wrap px-4 pb-0 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

        <h1 className="display-title mb-3 text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          {workspace.name}
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-base text-[var(--sea-ink-soft)]">
            Owner: <span className="font-medium text-[var(--sea-ink)]">{workspace.owner}</span>
          </p>
          <span className="text-[var(--sea-ink-soft)] opacity-40">·</span>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400">
            {workspace.role}
          </span>
        </div>
      </section>
    </div>
  )
}
