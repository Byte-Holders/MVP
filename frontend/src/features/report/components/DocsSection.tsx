import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ReportInfo } from '../types/report'

type Props = {
  docsReport: ReportInfo['data']['docsReport']
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-[var(--sea-ink)] opacity-70">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--chip-line)]">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  )
}

export function DocsSection({ docsReport }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--sea-ink)]">
          Analisi della documentazione
        </h2>
        <span className="text-xs text-[var(--sea-ink)] opacity-60">
          Score {docsReport.mark}/10
        </span>
      </div>

      <ScoreBar label="Punteggio" value={docsReport.mark} />

      <div>
        <p className="mb-2 text-xs font-medium text-[var(--sea-ink)] opacity-60">
          README
        </p>
        <div className="prose prose-sm max-w-none text-xs text-[var(--sea-ink)] opacity-80 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[var(--chip-line)] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[var(--chip-line)] [&_th]:px-2 [&_th]:py-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {docsReport.readmeReport}
          </ReactMarkdown>
        </div>
      </div>

      <hr className="border-[var(--chip-line)]" />

      <div>
        <p className="mb-2 text-xs font-medium text-[var(--sea-ink)] opacity-60">
          Commenti nel codice
        </p>
        <div className="prose prose-sm max-w-none text-xs text-[var(--sea-ink)] opacity-80">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {docsReport.commentReport}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  )
}
