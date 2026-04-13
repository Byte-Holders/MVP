import type { ReportInfo } from '../types/report'

type Props = {
  testReport: ReportInfo['data']['testReport']
}

function CoverageBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-[var(--sea-ink)] opacity-70">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--chip-line)]">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function TestSection({ testReport }: Props) {
  const { coverageReport, failedTests, testsRun } = testReport

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--sea-ink)]">
          Analisi dei test
        </h2>
        <span className="text-xs text-[var(--sea-ink)] opacity-60">
          {testsRun} test eseguiti
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <CoverageBar label="Statements" value={coverageReport.statements} />
        <CoverageBar label="Branches" value={coverageReport.branches} />
        <CoverageBar label="Functions" value={coverageReport.functions} />
        <CoverageBar label="Lines" value={coverageReport.lines} />
      </div>

      {failedTests.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-red-500">
            Test falliti ({failedTests.length})
          </p>
          <div className="flex flex-col gap-2">
            {failedTests.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs"
              >
                <p className="font-medium text-red-700">{t.name}</p>
                <p className="mt-0.5 text-red-500 opacity-80">{t.path}</p>
                <p className="mt-1 text-red-600">{t.messageSummary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
