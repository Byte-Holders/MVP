import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReportInfo } from '../types/report'

type Props = {
  testReport: ReportInfo['data']['testReport']
}

function coverageColor(value: number) {
  if (value >= 75) return '#4fb8b2'
  if (value >= 50) return '#f59e0b'
  return '#ef4444'
}

export function TestSection({ testReport }: Props) {
  const { coverageReport, failedTests, testsRun } = testReport

  const coverageData = [
    { label: 'Statements', value: coverageReport.statements },
    { label: 'Branches', value: coverageReport.branches },
    { label: 'Functions', value: coverageReport.functions },
    { label: 'Lines', value: coverageReport.lines },
  ]

  const avgCoverage =
    (coverageReport.statements +
      coverageReport.branches +
      coverageReport.functions +
      coverageReport.lines) /
    4

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--sea-ink)]">
          Analisi dei test
        </h2>
        <div className="flex items-center gap-3">
          {failedTests.length > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {failedTests.length} falliti
            </span>
          )}
          <span className="text-xs text-[var(--sea-ink)] opacity-60">
            {testsRun} test eseguiti
          </span>
        </div>
      </div>

      {/* Coverage media */}
      <div className="flex items-center gap-4 rounded-xl border border-[var(--chip-line)] p-3">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-[var(--sea-ink)]">
            {avgCoverage.toFixed(0)}
            <span className="text-sm font-normal opacity-50">%</span>
          </span>
          <span className="text-xs opacity-50">Coverage media</span>
        </div>
        <div className="h-10 w-px bg-[var(--chip-line)]" />
        <div className="flex flex-1 gap-4">
          {coverageData.map((c) => (
            <div key={c.label} className="flex flex-col items-center gap-0.5">
              <span
                className="text-sm font-semibold"
                style={{ color: coverageColor(c.value) }}
              >
                {c.value}%
              </span>
              <span className="text-[10px] opacity-50">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={coverageData} barSize={32}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--chip-line)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--sea-ink)', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'var(--sea-ink)', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(v) => [`${v}%`]}
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: '1px solid var(--chip-line)',
              background: 'var(--chip-bg)',
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {coverageData.map((c, i) => (
              <Cell key={i} fill={coverageColor(c.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Test falliti */}
      {failedTests.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-red-500">Test falliti</p>
          <div className="flex flex-col gap-2">
            {failedTests.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs"
              >
                <p className="font-medium text-red-700">{t.name}</p>
                <p className="mt-0.5 font-mono text-[10px] text-red-400">
                  {t.path}
                </p>
                <p className="mt-1 text-red-600">{t.messageSummary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {testsRun === 0 && (
        <p className="text-xs text-[var(--sea-ink)] opacity-50">
          Nessun test rilevato nel progetto.
        </p>
      )}
    </section>
  )
}
