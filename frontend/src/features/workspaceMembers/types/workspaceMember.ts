export interface WorkspaceMember {
  userId: string
  username: string
  role: string
}

export const WORKSPACE_ROLES = [
  'Project Manager',
  'Tech Lead',
  'Developer',
] as const
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]
