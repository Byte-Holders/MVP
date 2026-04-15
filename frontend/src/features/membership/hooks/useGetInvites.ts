import { useQuery } from '@tanstack/react-query'
import { membershipRepository } from '../model/membershipRepository'

export function useGetInvites() {
  return useQuery({
    queryKey: ['invites'],
    queryFn: () => membershipRepository.getInvites(),
  })
}
