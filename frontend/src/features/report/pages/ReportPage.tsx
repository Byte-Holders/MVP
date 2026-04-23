import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useReportPage } from '../hooks/useReportPage'
import { BranchSelector } from '../components/BranchSelector'
import { SummarySection } from '../components/SummarySection'
import { TechSection } from '../components/TechSection'
import { TestSection } from '../components/TestSection'
import { SecuritySection } from '../components/SecuritySection'
import { DocsSection } from '../components/DocsSection'
import { ScanButton } from '#/features/scan/components/ScanButton'
import { useGetRepository } from '../../workspaceRepository/hooks/useGetRepository'
import { UpdateTokenForm } from '../components/UpdateTokenForm'

type Props = {
  workspaceId: string
  repositoryId: string
}

const NAV_ITEMS = [
  { id: 'summary', label: 'Riepilogo' },
  { id: 'tech', label: 'Tecnologie' },
  { id: 'tests', label: 'Test' },
  { id: 'security', label: 'Sicurezza' },
  { id: 'docs', label: 'Documentazione' },
]

function scrollTo(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function ReportPage({ workspaceId, repositoryId }: Props) {
  const queryClient = useQueryClient()
  const [scanActive, setScanActive] = useState(false)
  const { data: repository } = useGetRepository(repositoryId)
  const ownerName = repository?.ownerName ?? ''
  const name = repository?.name ?? ''

  const {
    branches,
    branchesLoading,
    selectedBranch,
    setSelectedBranch,
    report,
    reportLoading,
    reportError,
  } = useReportPage(repositoryId)

  function handleScanCompleted() {
    void queryClient.invalidateQueries({
      queryKey: ['report', repositoryId, selectedBranch],
    })
  }

  return (
    <div className="page-wrap flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="sticky top-[72px] z-30 -mx-6 flex items-center justify-between border-b border-[var(--chip-line)] bg-[var(--header-bg)] px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-[var(--sea-ink)] opacity-60">
              {ownerName}
            </p>
            <h1 className="text-xl font-semibold text-[var(--sea-ink)]">
              {name}
            </h1>
          </div>
          <UpdateTokenForm
            workspaceId={workspaceId}
            repositoryId={repositoryId}
          />
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="branch-select"
            className="text-xs text-[var(--sea-ink)] opacity-60"
          >
            Branch
          </label>
          <BranchSelector
            branches={branches}
            isLoading={branchesLoading}
            selectedBranch={selectedBranch ?? ''}
            onChange={setSelectedBranch}
          />
          <ScanButton
            workspaceId={workspaceId}
            repositoryId={repositoryId}
            branch={selectedBranch ?? ''}
            onCompleted={handleScanCompleted}
            onScanActiveChange={setScanActive}
          />
        </div>
      </div>

      {reportLoading && !scanActive && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-[var(--chip-line)]"
            />
          ))}
        </div>
      )}

      {reportError && !scanActive && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          Nessun report disponibile per questo branch.
        </div>
      )}

      {report && (
        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <aside className="sticky top-[calc(72px+60px+1.5rem)] flex w-44 flex-shrink-0 flex-col gap-1">
            <button
              onClick={() => scrollTo('summary')}
              className="rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--sea-ink)] opacity-60 transition-colors hover:bg-[var(--chip-line)] hover:opacity-100"
            >
              Riepilogo
            </button>
            <hr className="my-1 border-[var(--chip-line)]" />
            {NAV_ITEMS.filter((i) => i.id !== 'summary').map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--sea-ink)] opacity-60 transition-colors hover:bg-[var(--chip-line)] hover:opacity-100"
              >
                {item.label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {report.summary && (
              <>
                <div id="summary">
                  <SummarySection
                    summary={report.summary}
                    metadata={report.metadata}
                  />
                </div>
                <hr className="border-[var(--chip-line)]" />
              </>
            )}
            <div id="tech">
              <TechSection
                techReport={report.data.techReport}
                allDeps={report.data.depsReport.list}
              />
            </div>
            <div id="tests">
              <TestSection testReport={report.data.testReport} />
            </div>
            <div id="security">
              <SecuritySection
                vulnerabilitiesReport={report.data.vulnerabilitiesReport}
                depsReport={report.data.depsReport}
              />
            </div>
            <div id="docs">
              <DocsSection docsReport={report.data.docsReport} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
