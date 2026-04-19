import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { WorkspaceList } from '@/features/workspaceList/components/WorkspaceList'

export function WorkspacesPage() {
  // pagina principale che mostra la lista dei workspace dell'utente
  return (
    <ProtectedRoute>
    <main className="page-wrap px-4 pb-8 pt-14 min-h-[calc(100vh-120px)]">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(124,92,231,0.28),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(90,61,191,0.16),transparent_66%)]" />
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          Workspaces
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Gestici i tuoi workspace, organizza i tuoi progetti e collabora con il
          tuo team in modo semplice ed efficiente.
        </p>
      </section>
      <WorkspaceList />
    </main>
    </ProtectedRoute>
  )
}
