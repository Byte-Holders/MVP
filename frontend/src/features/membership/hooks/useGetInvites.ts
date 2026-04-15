import { useQuery } from '@tanstack/react-query'
import { getInvitesRepository } from '../model/getInvitesData'

export function useGetInvites() {
  return useQuery({
    queryKey: ['invites'],
    queryFn: () => getInvitesRepository.getInvites(),
  })
}
