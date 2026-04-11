import type { ReportInfo } from '../types/report'

type Props = {
  vulnerabilitiesReport: ReportInfo['data']['vulnerabilitiesReport']
  depsReport: ReportInfo['data']['depsReport']
}

function SeverityBadge({ severity }: { severity: number }) {
  const { label, color } =
    severity <= 3.9
      ? { label: 'Low', color: 'bg-green-100 text-green-700' }
      : severity <= 6.9
        ? { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' }
        : severity <= 8.9
          ? { label: 'High', color: 'bg-orange-100 text-orange-700' }
          : { label: 'Critical', color: 'bg-red-100 text-red-700' }

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {label} {severity.toFixed(1)}
    </span>
  )
}

export function SecuritySection({ vulnerabilitiesReport, depsReport }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--sea-ink)]">
          Analisi della sicurezza
        </h2>
        <span className="text-xs text-[var(--sea-ink)] opacity-60">
          CVSS {vulnerabilitiesReport.mark.toFixed(1)}
        </span>
      </div>

      {vulnerabilitiesReport.vulnerabilities.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Vulnerabilità codice ({vulnerabilitiesReport.vulnerabilities.length})
          </p>
          {vulnerabilitiesReport.vulnerabilities.map((v) => (
            <div
              key={v.id}
              className="rounded-lg border border-[var(--chip-line)] p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-[var(--sea-ink)]">
                  {v.category}
                </span>
                <SeverityBadge severity={v.severity} />
              </div>
              <p className="mt-1 text-[var(--sea-ink)] opacity-70">
                {v.description}
              </p>
              <p className="mt-0.5 opacity-50">{v.path}</p>
              {v.cwe.length > 0 && (
                <p className="mt-1 opacity-50">CWE: {v.cwe.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-green-600">Nessuna vulnerabilità nel codice</p>
      )}

      {depsReport.vulnerabilities.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Dipendenze vulnerabili ({depsReport.vulnerabilities.length})
          </p>
          {depsReport.vulnerabilities.map((v) => (
            <div
              key={v.id}
              className="rounded-lg border border-[var(--chip-line)] p-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--sea-ink)]">
                  {v.packageName}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    v.severity === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : v.severity === 'high'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {v.severity}
                </span>
              </div>
              <p className="mt-0.5 opacity-50">{v.packageVersion}</p>
            </div>
          ))}
        </div>
      )}

      {depsReport.vulnerabilityAnalysis && (
        <div>
          <p className="mb-1 text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Analisi dipendenze
          </p>
          <p className="text-xs text-[var(--sea-ink)] opacity-80">
            {depsReport.vulnerabilityAnalysis}
          </p>
        </div>
      )}
    </section>
  )
}
