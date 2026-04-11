import type { ReportInfo } from '../types/report'

type Props = {
  techReport: ReportInfo['data']['techReport']
}

export function TechSection({ techReport }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <h2 className="text-base font-semibold text-[var(--sea-ink)]">
        Informazioni tecniche
      </h2>

      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1 text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Linguaggi
          </p>
          <div className="flex flex-wrap gap-2">
            {techReport.languages.map((l) => (
              <span
                key={l.name}
                className="rounded-full bg-[var(--chip-line)] px-3 py-0.5 text-xs text-[var(--sea-ink)]"
              >
                {l.name} {l.value}%
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Framework
          </p>
          <div className="flex flex-wrap gap-2">
            {techReport.frameworks.length > 0 ? (
              techReport.frameworks.map((f) => (
                <span
                  key={f.name}
                  className="rounded-full bg-[var(--chip-line)] px-3 py-0.5 text-xs text-[var(--sea-ink)]"
                >
                  {f.name} {f.version}
                </span>
              ))
            ) : (
              <span className="text-xs opacity-50">Nessuno rilevato</span>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Librerie
          </p>
          <div className="flex flex-col gap-1 text-xs text-[var(--sea-ink)]">
            {techReport.libraries.length > 0 ? (
              techReport.libraries.map((lib) => (
                <div key={lib.name} className="flex justify-between">
                  <span>{lib.name}</span>
                  <span className="opacity-60">{lib.version}</span>
                </div>
              ))
            ) : (
              <span className="opacity-50">Nessuna rilevata</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
