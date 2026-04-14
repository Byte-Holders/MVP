import { useState, useEffect } from 'react'
import { useGetBranches } from './useGetBranches'
import { useGetReport } from './useGetReport'
import type { IReportPageViewModel } from '../interfaces/IUseReportPage'

export function useReportPage(repositoryId: string): IReportPageViewModel {
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    undefined,
  )
  const [userSelected, setUserSelected] = useState(false)

  const { data: branches = [], isLoading: branchesLoading } =
    useGetBranches(repositoryId)

  useEffect(() => {
    if (!userSelected && branches.length > 0) {
      const develop = branches.find((b) => b === 'develop')
      setSelectedBranch(develop ?? branches[0])
    }
  }, [branches, userSelected])

  function handleBranchChange(branch: string) {
    setUserSelected(true)
    setSelectedBranch(branch)
  }

  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useGetReport(repositoryId, selectedBranch)

  return {
    branches,
    branchesLoading,
    selectedBranch,
    setSelectedBranch: handleBranchChange,
    report,
    reportLoading,
    reportError,
  }
}
