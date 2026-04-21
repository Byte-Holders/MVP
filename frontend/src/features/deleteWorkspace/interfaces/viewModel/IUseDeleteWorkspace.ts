export interface IUseDeleteWorkspaceViewModel {
  execute: (workspaceId: string) => Promise<void>
  loading: boolean
  error: string | null
}
