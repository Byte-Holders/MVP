import { useGetMembers } from './useGetMembers'
import { useRemoveMember } from './useRemoveMember'
import { useInviteMember } from './useInviteMember'
import type { IMembersPageViewModel } from '../types/viewModels'

export function useMembersPage(workspaceId: string): IMembersPageViewModel {
  const { data: members = [], isLoading: membersLoading } =
    useGetMembers(workspaceId)
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveMember(workspaceId)
  const inviteForm = useInviteMember(workspaceId)

  return {
    members,
    membersLoading,
    removeMember,
    isRemoving,
    inviteForm,
  }
}
