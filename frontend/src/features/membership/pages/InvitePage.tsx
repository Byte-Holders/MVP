import { InviteList } from '../components/InviteList'

export function InvitePage() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14 min-h-[calc(100vh-120px)]">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          Gestione inviti ricevuti
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Gestisci i tuoi inviti ai workspace: accetta o rifiuta le richieste pendenti.
        </p>
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <InviteList />
      </section>
    </main>
  )
}