import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ReportInfo } from '../types/report'
import { ScoreBar } from '../../../components/ScoreBar'

type Props = {
  docsReport: ReportInfo['data']['docsReport']
}

export function DocsSection({ docsReport }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5">
      <h2 className="text-base font-semibold text-[var(--sea-ink)]">
        Analisi della documentazione
      </h2>

      <ScoreBar label="Voto" value={docsReport.mark} />

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--sea-ink)] opacity-60">
          README
        </p>
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-[var(--sea-ink)] opacity-80 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[var(--chip-line)] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[var(--chip-line)] [&_th]:px-2 [&_th]:py-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {docsReport.readmeReport}
          </ReactMarkdown>
        </div>
      </div>

      <hr className="border-[var(--chip-line)]" />

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--sea-ink)] opacity-60">
          Commenti nel codice
        </p>
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-[var(--sea-ink)] opacity-80">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {docsReport.commentReport}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  )
}
