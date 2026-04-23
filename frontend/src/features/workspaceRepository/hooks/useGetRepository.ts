import { useQuery } from '@tanstack/react-query'
import { getRepositoryRepository } from '../model/getRepositoryData'

export function useGetRepository(repositoryId: string) {
  return useQuery({
    queryKey: ['repository', repositoryId],
    queryFn: () => getRepositoryRepository.getRepository(repositoryId),
    enabled: !!repositoryId,
  })
}
