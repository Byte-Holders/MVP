import { useQuery } from '@tanstack/react-query'
import { getBranchesRepository } from '../model/getBranchesData'

export function useGetBranches(repositoryId: string) {
  return useQuery({
    queryKey: ['branches', repositoryId],
    queryFn: () => getBranchesRepository.getBranches(repositoryId),
    enabled: !!repositoryId,
  })
}
