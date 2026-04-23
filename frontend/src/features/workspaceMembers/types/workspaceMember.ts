export interface WorkspaceMember {
  userId: string
  username: string
  role: string
}

export const WORKSPACE_ROLES = [
  'project manager',
  'tech lead',
  'developer',
] as const
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]
