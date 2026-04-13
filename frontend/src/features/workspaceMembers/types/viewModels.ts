import type { WorkspaceMember, WorkspaceRole } from './workspaceMember'

export interface IInviteMemberViewModel {
  username: string
  setUsername: (username: string) => void
  role: WorkspaceRole
  setRole: (role: WorkspaceRole) => void
  isPending: boolean
  error: Error | null
  isSuccess: boolean
  handleSubmit: (e: SubmitEvent) => void
}

export interface IMembersPageViewModel {
  members: WorkspaceMember[]
  membersLoading: boolean
  removeMember: (userId: string) => void
  isRemoving: boolean
  inviteForm: IInviteMemberViewModel
}
