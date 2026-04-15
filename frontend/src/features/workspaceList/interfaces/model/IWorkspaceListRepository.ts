import type { WorkspaceListItem } from '../../types/Workspace'

export interface IWorkspaceListRepository {
  getWorkspaces(): Promise<WorkspaceListItem[]>
}
