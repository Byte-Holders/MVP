import type { WorkspaceListItem } from './Workspace'

export interface IWorkspacesViewModel {
  workspaces: WorkspaceListItem[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}
