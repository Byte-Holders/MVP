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
    <main className="flex flex-col">
      <section className="relative min-h-[90vh] flex items-center justify-center text-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/banner.mp4" type="video/mp4" />
        </video>

        {/* overlay scuro per leggibilità */}
        <div className="absolute inset-0 bg-black/50" />

        {/* contenuto */}
        <div className="relative z-10 text-white px-6">
          <img
            src="/logo_codeguardian1.png"
            alt="Logo"
            className="h-40 w-auto align-middle mb-4 mx-auto"
          />
          <p className="mt-4 max-w-xl mx-auto text-lg sm:text-xl font-medium text-white/90">
            Analizza, migliora e protegge il tuo codice automaticamente.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 flex justify-center">
        <blockquote className="max-w-3xl text-center">
          <p className="text-xl sm:text-2xl font-medium text-[var(--sea-ink)] leading-relaxed">
            “Sistema ad agenti, analisi dei repository GitHub, report
            intelligenti e remediation automatizzata:
            <span className="font-semibold"> CodeGuardian </span>è la
            piattaforma che semplifica l'audit e porta la qualità del codice a
            un livello superiore.”
          </p>

          <div className="mt-6 h-[2px] w-16 mx-auto bg-[var(--sea-ink-soft)] rounded-full" />
        </blockquote>
      </section>

      {/* CHI SIAMO */}
      <section className="px-6 py-16 flex justify-center">
        <div className="w-full max-w-[1200px]">
          <h2 className="display-title mb-5 max-w-3xl text-2xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
            Chi siamo
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl max-w-[1200px]">
            <div className="island-shell flex overflow-hidden rounded-2xl">
              {/* testo */}
              <div className="p-6 flex flex-col justify-center flex-[2]">
                <h3 className="text-lg font-semibold mb-2">Byte-Holders</h3>

                <p className="text-[var(--sea-ink-soft)]">
                  Gruppo di studenti dell'università di Padova, che hanno
                  progettato e realizzato la piattaforma CodeGuardian.
                </p>
              </div>

              {/* immagine */}
              <div className="flex-[1] flex items-center justify-center p-4">
                <img
                  src="/logo.png"
                  alt="Byte-Holders"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* CARD 2 */}
            <div className="island-shell flex overflow-hidden rounded-2xl">
              {/* testo */}
              <div className="p-6 flex flex-col justify-center flex-[2]">
                <h3 className="text-lg font-semibold mb-2">Var Group</h3>

                <p className="text-[var(--sea-ink-soft)] mb-3">
                  Lavoriamo con sinergia e passione per la crescita di ogni
                  azienda. Idee, competenze, trend tecnologici e nuovi modelli
                  organizzativi sono la chiave del cambiamento e le basi sulla
                  quale costruiamo il nostro lavoro quotidiano in Italia e nel
                  mondo.
                </p>

                <a
                  href="https://www.vargroup.com/it-IT"
                  target="_blank"
                  className="text-[var(--sea-ink)] hover:underline"
                >
                  Scopri Var Group →
                </a>
              </div>

              {/* immagine */}
              <div className="flex-[1] flex items-center justify-center p-4">
                <img
                  src="/vargroup.webp"
                  alt="Var Group"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTAZIONE */}
      <section className="px-6 py-16 flex justify-center">
        <div className="w-full max-w-[1200px]">
          <h2 className="display-title mb-10 text-2xl sm:text-5xl font-bold text-[var(--sea-ink)]">
            Documentazione
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <a
              href="https://github.com/tuo-repo"
              target="_blank"
              className="island-shell p-6 rounded-2xl hover:shadow-md transition"
            >
              <h3 className="font-semibold mb-2">Repository</h3>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Codice sorgente del progetto su GitHub
              </p>
            </a>
            <a
              href="/manuale.pdf"
              target="_blank"
              className="island-shell p-6 rounded-2xl hover:shadow-md transition"
            >
              <h3 className="font-semibold mb-2">Manuale Utente</h3>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Guida all'utilizzo della piattaforma
              </p>
            </a>
            <a
              href="/requisiti.pdf"
              target="_blank"
              className="island-shell p-6 rounded-2xl hover:shadow-md transition"
            >
              <h3 className="font-semibold mb-2">Requisiti</h3>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Analisi dei requisiti del sistema
              </p>
            </a>
            <a
              href="/specifiche.pdf"
              target="_blank"
              className="island-shell p-6 rounded-2xl hover:shadow-md transition"
            >
              <h3 className="font-semibold mb-2">Specifiche</h3>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Dettagli tecnici e architetturali
              </p>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
