import { useQuery } from '@tanstack/react-query'
import { reportRepository } from '../model/reportRepository'

export function useGetReport(repositoryId: string, branch: string | undefined) {
  return useQuery({
    queryKey: ['report', repositoryId, branch],
    queryFn: () => reportRepository.getReport(repositoryId, branch!),
    enabled: !!branch,
  })
}
