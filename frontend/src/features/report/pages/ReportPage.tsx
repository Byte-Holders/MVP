import { useReportPage } from '../hooks/useReportPage'
import { BranchSelector } from '../components/BranchSelector'
import { TechSection } from '../components/TechSection'
import { TestSection } from '../components/TestSection'
import { SecuritySection } from '../components/SecuritySection'
import { DocsSection } from '../components/DocsSection'
import { ScanButton } from '#/features/repo/components/ScanButton'

type Props = {
  workspaceId: string
  repositoryId: string
  ownerName: string
  name: string
}

export function ReportPage({
  workspaceId,
  repositoryId,
  ownerName,
  name,
}: Props) {
  const {
    branches,
    branchesLoading,
    selectedBranch,
    setSelectedBranch,
    report,
    reportLoading,
    reportError,
  } = useReportPage(repositoryId)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--sea-ink)] opacity-60">
            {ownerName}
          </p>
          <h1 className="text-xl font-semibold text-[var(--sea-ink)]">
            {name}
          </h1>
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
            selectedBranch={selectedBranch}
            onChange={setSelectedBranch}
          />
          <ScanButton
            workspaceId={workspaceId}
            repositoryId={repositoryId}
            branch={selectedBranch}
          />
        </div>
      </div>

      {reportLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-[var(--chip-line)]"
            />
          ))}
        </div>
      )}

      {reportError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          Nessun report disponibile per questo branch.
        </div>
      )}

      {report && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TechSection techReport={report.data.techReport} />
          <TestSection testReport={report.data.testReport} />
          <SecuritySection
            vulnerabilitiesReport={report.data.vulnerabilitiesReport}
            depsReport={report.data.depsReport}
          />
          <DocsSection docsReport={report.data.docsReport} />
        </div>
      )}
    </div>
  )
}
