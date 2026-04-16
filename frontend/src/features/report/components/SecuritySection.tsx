import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BarShapeProps } from 'recharts'
import type { ReportInfo } from '../types/report'
import { ScoreBar } from '../../../components/ScoreBar'

type Props = {
  vulnerabilitiesReport: ReportInfo['data']['vulnerabilitiesReport']
  depsReport: ReportInfo['data']['depsReport']
}

const SEVERITY_CONFIG: Record<
  string,
  { color: string; bg: string; text: string }
> = {
  Critical: {
    color: '#dc2626',
    bg: 'bg-red-100    dark:bg-red-900/40',
    text: 'text-red-700    dark:text-red-300',
  },
  High: {
    color: '#ea580c',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-300',
  },
  Medium: {
    color: '#d97706',
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  Low: {
    color: '#16a34a',
    bg: 'bg-green-100  dark:bg-green-900/40',
    text: 'text-green-700  dark:text-green-300',
  },
  Negligible: {
    color: '#6b7280',
    bg: 'bg-gray-100   dark:bg-gray-700/40',
    text: 'text-gray-600   dark:text-gray-300',
  },
}

function severityConfig(s: string) {
  return (
    SEVERITY_CONFIG[s] ?? {
      color: '#6b7280',
      bg: 'bg-gray-100  dark:bg-gray-700/40',
      text: 'text-gray-600 dark:text-gray-300',
    }
  )
}

function codeSeverityLabel(score: number) {
  if (score >= 9) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 4) return 'Medium'
  return 'Low'
}

export function SecuritySection({ vulnerabilitiesReport, depsReport }: Props) {
  const [expandedVuln, setExpandedVuln] = useState<string | null>(null)
  const [depsOpen, setDepsOpen] = useState(false)

  const CODE_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const
  const DEPS_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const

  // ── Dipendenze: raggruppa per severity ────────────────────────────────────
  const depsBySeverity: Record<string, number> = depsReport.vulnCounts
    ? {
        Critical: depsReport.vulnCounts.critical,
        High: depsReport.vulnCounts.high,
        Medium: depsReport.vulnCounts.medium,
        Low: depsReport.vulnCounts.low,
      }
    : depsReport.vulnerabilities.reduce<Record<string, number>>((acc, v) => {
        acc[v.severity] = (acc[v.severity] ?? 0) + 1
        return acc
      }, {})

  const depsPieData = DEPS_LEVELS.map((name) => ({
    name,
    value: depsBySeverity[name] ?? 0,
    fill: severityConfig(name).color,
  }))

  // ── Vulnerabilità codice: raggruppa per severity ──────────────────────────
  const codeVulnsBySeverity: Record<string, number> =
    vulnerabilitiesReport.vulnCounts
      ? {
          Critical: vulnerabilitiesReport.vulnCounts.critical,
          High: vulnerabilitiesReport.vulnCounts.high,
          Medium: vulnerabilitiesReport.vulnCounts.medium,
          Low: vulnerabilitiesReport.vulnCounts.low,
        }
      : vulnerabilitiesReport.vulnerabilities.reduce<Record<string, number>>(
          (acc, v) => {
            const l = codeSeverityLabel(v.severity)
            acc[l] = (acc[l] ?? 0) + 1
            return acc
          },
          {},
        )

  const totalCodeVulns = vulnerabilitiesReport.vulnCounts
    ? Object.values(codeVulnsBySeverity).reduce((a, b) => a + b, 0)
    : vulnerabilitiesReport.vulnerabilities.length

  const totalDepsVulns = depsReport.vulnCounts
    ? Object.values(depsBySeverity).reduce((a, b) => a + b, 0)
    : depsReport.vulnerabilities.length

  const codePieData = CODE_LEVELS.map((name) => ({
    name,
    value: codeVulnsBySeverity[name] ?? 0,
    fill: severityConfig(name).color,
  }))

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <h2 className="text-base font-semibold text-[var(--sea-ink)]">
        Analisi della sicurezza
      </h2>

      <ScoreBar
        label="Voto"
        value={parseFloat(vulnerabilitiesReport.mark.toFixed(1))}
      />

      {/* ── Overview ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {(
          [
            ['Vulnerabilità codice', totalCodeVulns],
            ['Dipendenze vulnerabili', totalDepsVulns],
            ['Critiche (codice)', codeVulnsBySeverity['Critical'] ?? 0],
            ['Critiche (dipendenze)', depsBySeverity['Critical'] ?? 0],
          ] as [string, number][]
        ).map(([label, count]) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 rounded-xl border border-[var(--chip-line)] p-3"
          >
            <span className="text-xl font-bold text-[var(--sea-ink)]">
              {count}
            </span>
            <span className="text-[10px] leading-tight opacity-50">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Bar charts ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Vulnerabilità codice */}
        {codePieData.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium text-[var(--sea-ink)] opacity-60">
              Vulnerabilità codice per severità
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={codePieData}
                barCategoryGap="10%"
                margin={{ top: 14, right: 4, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--chip-line)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--sea-ink)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'var(--chip-line)', opacity: 0.4 }}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: '1px solid var(--chip-line)',
                    background: 'var(--chip-bg)',
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  shape={(props: BarShapeProps) => (
                    <Rectangle {...props} fill={props.fill} />
                  )}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: 'var(--sea-ink)',
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Dipendenze vulnerabili */}
        {depsPieData.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium text-[var(--sea-ink)] opacity-60">
              Dipendenze vulnerabili per severità
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={depsPieData}
                barCategoryGap="10%"
                margin={{ top: 14, right: 4, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--chip-line)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--sea-ink)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'var(--chip-line)', opacity: 0.4 }}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: '1px solid var(--chip-line)',
                    background: 'var(--chip-bg)',
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  shape={(props: BarShapeProps) => (
                    <Rectangle {...props} fill={props.fill} />
                  )}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: 'var(--sea-ink)',
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Vulnerabilità codice: lista espandibile ─────────────────────────── */}
      {vulnerabilitiesReport.vulnerabilities.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Vulnerabilità nel codice (
            {vulnerabilitiesReport.vulnerabilities.length})
          </p>
          <div className="flex flex-col gap-2">
            {vulnerabilitiesReport.vulnerabilities.map((v, i) => {
              const label = codeSeverityLabel(v.severity)
              const cfg = severityConfig(label)
              const key = `${v.id}-${v.path}-${i}`
              const isOpen = expandedVuln === key

              return (
                <div
                  key={key}
                  className="rounded-lg border border-[var(--chip-line)] text-xs"
                >
                  <button
                    onClick={() => setExpandedVuln(isOpen ? null : key)}
                    className="flex w-full items-center justify-between gap-2 p-3 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}
                      >
                        {label}
                      </span>
                      <span className="font-medium text-[var(--sea-ink)] truncate">
                        {v.description || v.id}
                      </span>
                    </div>
                    <span className="flex-shrink-0 opacity-40">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[var(--chip-line)] p-3 flex flex-col gap-2">
                      <p className="font-mono text-[10px] text-[var(--sea-ink)] opacity-50">
                        {v.path}
                      </p>
                      {v.remediation && (
                        <div>
                          <span className="font-medium text-[var(--sea-ink)] opacity-60">
                            Rimedio
                          </span>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-[var(--sea-ink)] opacity-80 mt-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{v.remediation}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                      {v.cwe && (
                        <span className="rounded bg-[var(--chip-line)] px-1.5 py-0.5 text-[10px] text-[var(--sea-ink)] opacity-70 w-fit">
                          {v.cwe}
                        </span>
                      )}
                      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                      {v.owasp && v.owasp.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {v.owasp.map((o) => (
                            <span
                              key={o}
                              className="rounded bg-[var(--lagoon)]/10 px-1.5 py-0.5 text-[10px] text-[var(--lagoon-deep)]"
                            >
                              {o}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Dipendenze vulnerabili: raggruppate per pacchetto ─────────────── */}
      {depsReport.vulnerabilities.length > 0 &&
        (() => {
          const grouped = depsReport.vulnerabilities.reduce<
            Record<string, typeof depsReport.vulnerabilities>
          >((acc, v) => {
            const key = `${v.packageName}@${v.packageVersion}`
            const existing = acc[key] ?? []
            if (!existing.some((e) => e.id === v.id)) existing.push(v)
            acc[key] = existing
            return acc
          }, {})

          const pkgCount = Object.keys(grouped).length

          return (
            <div className="rounded-lg border border-[var(--chip-line)] overflow-hidden">
              <button
                onClick={() => setDepsOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs"
              >
                <span className="font-medium text-[var(--sea-ink)] opacity-60">
                  Dipendenze vulnerabili ({pkgCount} pacchetti,{' '}
                  {depsReport.vulnerabilities.length} CVE)
                </span>
                <span className="opacity-40">{depsOpen ? '▲' : '▼'}</span>
              </button>

              {depsOpen && (
                <table className="w-full text-[11px] border-t border-[var(--chip-line)]">
                  <thead>
                    <tr className="border-b border-[var(--chip-line)] text-[var(--sea-ink)] opacity-50">
                      <th className="text-left px-3 py-1.5 font-medium">
                        Pacchetto
                      </th>
                      <th className="text-left px-3 py-1.5 font-medium">CVE</th>
                      <th className="text-left px-3 py-1.5 font-medium">Fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--chip-line)]">
                    {Object.entries(grouped).map(([pkg, vulns]) => {
                      const fixVersion = vulns.find(
                        (v) => v.fixVersion,
                      )?.fixVersion
                      return (
                        <tr key={pkg}>
                          <td className="px-3 py-1.5 whitespace-nowrap font-medium text-[var(--sea-ink)]">
                            {pkg}
                          </td>
                          <td className="px-3 py-1.5">
                            <div className="flex flex-col gap-1">
                              {vulns.map((v) => {
                                const cfg = severityConfig(v.severity)
                                return (
                                  <div
                                    key={v.id}
                                    className="flex items-center gap-1.5 min-w-0"
                                  >
                                    <span
                                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}
                                    >
                                      {v.severity}
                                    </span>
                                    <span className="text-[10px] text-[var(--sea-ink)] opacity-70 truncate">
                                      {v.description ?? v.id}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-green-600 dark:text-green-400">
                            {fixVersion ?? (
                              <span className="opacity-30">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )
        })()}

      {/* ── Analisi testuale ───────────────────────────────────────────────── */}
      {depsReport.vulnerabilityAnalysis && (
        <div className="rounded-xl border border-[var(--chip-line)] p-3">
          <p className="mb-1 text-xs font-medium text-[var(--sea-ink)] opacity-60">
            Analisi
          </p>
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-[var(--sea-ink)] opacity-80">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{depsReport.vulnerabilityAnalysis}</ReactMarkdown>
          </div>
        </div>
      )}

      {totalCodeVulns === 0 && totalDepsVulns === 0 && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Nessuna vulnerabilità rilevata.
        </p>
      )}
    </section>
  )
}
