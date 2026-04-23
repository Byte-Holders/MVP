import { useQuery } from '@tanstack/react-query'
import { getReportRepository } from '../model/getReportData'

export function useGetReport(repositoryId: string, branch: string | undefined) {
  return useQuery({
    queryKey: ['report', repositoryId, branch],
    queryFn: () => getReportRepository.getReport(repositoryId, branch!),
    enabled: !!branch,
    retry: false,
  })
}
