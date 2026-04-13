import { useState, useEffect } from 'react'
import { useGetBranches } from './useGetBranches'
import { useGetReport } from './useGetReport'

export function useReportPage(repositoryId: string) {
  const [selectedBranch, setSelectedBranch] = useState<string>('develop')

  const { data: branches = [], isLoading: branchesLoading } =
    useGetBranches(repositoryId)

  useEffect(() => {
    if (branches && branches.length > 0) {
      const develop = branches.find((b) => b === 'develop')
      setSelectedBranch(develop ?? branches[0])
    }
  }, [branches])

  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useGetReport(repositoryId, selectedBranch)

  return {
    branches,
    branchesLoading,
    selectedBranch,
    setSelectedBranch,
    report,
    reportLoading,
    reportError,
  }
}
