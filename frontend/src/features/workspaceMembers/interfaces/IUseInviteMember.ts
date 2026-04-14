import type { WorkspaceRole } from '../types/workspaceMember'

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
