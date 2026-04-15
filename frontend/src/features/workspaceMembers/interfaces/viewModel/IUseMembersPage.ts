import type { WorkspaceMember } from '../types/workspaceMember'
import type { IInviteMemberViewModel } from './useInviteMember'

export interface IMembersPageViewModel {
  members: WorkspaceMember[]
  membersLoading: boolean
  removeMember: (userId: string) => void
  isRemoving: boolean
  inviteForm: IInviteMemberViewModel
}
