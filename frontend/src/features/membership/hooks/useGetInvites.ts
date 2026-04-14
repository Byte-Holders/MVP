import { useQuery } from '@tanstack/react-query'
import { getInvitesData } from '../model/getInvitesData'

export function useGetInvites() {
  return useQuery({
    queryKey: ['invites'],
    queryFn: getInvitesData,
  })
}
