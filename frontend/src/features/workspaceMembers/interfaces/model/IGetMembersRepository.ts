import type { WorkspaceMember } from '../../types/workspaceMember'

export interface IGetMembersRepository {
  getMembers(workspaceId: string): Promise<WorkspaceMember[]>
}
