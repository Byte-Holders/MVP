import { useQuery } from '@tanstack/react-query'
import { getReportData } from '../model/getReportData'

export function useGetReport(
  owner: string,
  repository: string,
  branch: string | undefined,
) {
  return useQuery({
    queryKey: ['report', owner, repository, branch],
    queryFn: () => getReportData(owner, repository, branch!),
    enabled: !!branch,
  })
}
