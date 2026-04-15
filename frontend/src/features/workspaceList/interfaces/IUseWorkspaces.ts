import type { WorkspaceListItem } from '../types/Workspace'

export interface IWorkspacesViewModel {
  workspaces: WorkspaceListItem[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}
