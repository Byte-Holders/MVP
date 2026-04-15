import { useQuery } from '@tanstack/react-query'
import { reportRepository } from '../model/reportRepository'

export function useGetBranches(repositoryId: string) {
  return useQuery({
    queryKey: ['branches', repositoryId],
    queryFn: () => reportRepository.getBranches(repositoryId),
    enabled: !!repositoryId,
  })
}
