import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ReportInfo } from '../types/report'

type Props = {
  techReport: ReportInfo['data']['techReport']
  allDeps?: ReportInfo['data']['depsReport']['list']
}

const PIE_COLORS = [
  '#3a0ca3', // Indaco profondo
  '#560bad', // Viola intenso
  '#7209b7', // Viola brillante
  '#b5179e', // Fucsia scuro
  '#f72585', // Rosa magenta acceso
  '#ff9ebb', // Rosa tenue
  '#e0aaff', // Lilla freddo
];

export function TechSection({ techReport, allDeps }: Props) {
  const langData = techReport.languages
    .filter((l) => l.value >= 1)
    .map((l, i) => ({
      name: l.name,
      value: parseFloat(l.value.toFixed(1)),
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }))

  const minorLangs = techReport.languages.filter((l) => l.value < 1)

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <h2 className="text-base font-semibold text-[var(--sea-ink)]">
        Informazioni tecniche
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Pie chart linguaggi */}
        <div>
          <p className="mb-3 text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Linguaggi
          </p>
          {langData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={langData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  />
                  <Tooltip
                    formatter={(v) => `${v}%`}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: '1px solid var(--chip-line)',
                      background: 'var(--chip-bg)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5">
                {langData.map((l, i) => (
                  <div key={l.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-[var(--sea-ink)]">{l.name}</span>
                    <span className="ml-auto opacity-50">{l.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs opacity-50">Nessun linguaggio rilevato</p>
          )}
          {minorLangs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {minorLangs.map((l) => (
                <span
                  key={l.name}
                  className="rounded-full border border-[var(--chip-line)] px-2 py-0.5 text-[10px] text-[var(--sea-ink)] opacity-50"
                >
                  {l.name} &lt;1%
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Framework + Librerie */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--sea-ink)] opacity-60">
              Framework ({techReport.frameworks.length})
            </p>
            {techReport.frameworks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {techReport.frameworks.map((f) => (
                  <span
                    key={f.name}
                    className="rounded-full border border-[var(--chip-line)] bg-[var(--lagoon)]/10 px-3 py-0.5 text-xs font-medium text-[var(--lagoon-deep)]"
                  >
                    {f.name} <span className="opacity-60">{f.version}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs opacity-50">Nessuno rilevato</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[var(--sea-ink)] opacity-60">
              Librerie ({techReport.libraries.length})
            </p>
            {techReport.libraries.length > 0 ? (
              <div className="max-h-40 overflow-y-auto pr-1">
                <table className="w-full text-xs">
                  <tbody>
                    {techReport.libraries.map((lib) => (
                      <tr
                        key={lib.name}
                        className="border-b border-[var(--chip-line)] last:border-0"
                      >
                        <td className="py-1 font-medium text-[var(--sea-ink)]">
                          {lib.name}
                        </td>
                        <td className="py-1 text-right opacity-50">
                          {lib.version}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs opacity-50">Nessuna rilevata</p>
            )}
          </div>
        </div>
      </div>

      {allDeps && allDeps.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Tutte le dipendenze rilevate ({allDeps.length})
          </p>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--chip-line)]">
            <table className="w-full text-xs">
              <tbody>
                {allDeps.map((dep, i) => (
                  <tr
                    key={dep.name + dep.version + i}
                    className="border-b border-[var(--chip-line)] last:border-0"
                  >
                    <td className="px-3 py-1.5 font-medium text-[var(--sea-ink)]">
                      {dep.name}
                    </td>
                    <td className="px-3 py-1.5 text-right opacity-50">
                      {dep.version}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
