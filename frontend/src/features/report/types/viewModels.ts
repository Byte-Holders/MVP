import type { ReportInfo } from './report'

export interface IReportPageViewModel {
  branches: string[]
  branchesLoading: boolean
  selectedBranch: string | undefined
  setSelectedBranch: (branch: string) => void
  report: ReportInfo | undefined
  reportLoading: boolean
  reportError: Error | null
}
