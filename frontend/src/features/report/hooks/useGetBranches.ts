import { useQuery } from '@tanstack/react-query'
import { getBranchesData } from '../model/getBranchesData'

export function useGetBranches(repositoryId: string) {
  return useQuery({
    queryKey: ['branches', repositoryId],
    queryFn: () => getBranchesData(repositoryId),
    enabled: !!repositoryId,
  })
}
