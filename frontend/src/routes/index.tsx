import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
  errorComponent: ErrorBoundary, // Aggiungi un componente per gestire gli errori
})

function ErrorBoundary({ error }: { error: Error }) {
  console.error(error) // Logga l'errore per il debug
  if (error.message === 'Not authenticated') {
    window.location.href = '/login' // Reindirizza alla pagina di login
    return null
  }
  return (
    <div>
      <h1>Oops! Something went wrong.</h1>
      <p>{error.message}</p>
    </div>
  )
}

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          CodeGuardian
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Analizza la qualità del tuo codice, monitora la sicurezza e tieni
          sotto controllo la copertura dei test.
        </p>
      </section>
    </main>
  )
}
