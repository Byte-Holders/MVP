import { useQuery } from '@tanstack/react-query'
import { getReportData } from '../model/getReportData'

export function useGetReport(repositoryId: string, branch: string | undefined) {
  return useQuery({
    queryKey: ['report', repositoryId, branch],
    queryFn: () => getReportData(repositoryId, branch!),
    enabled: !!branch,
  })
}
