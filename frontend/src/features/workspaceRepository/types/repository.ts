export interface RepositoryInWorkspace {
  repoId: string
  name: string
  owner: string
  apiToken: string
}

export interface AddRepositoryRequest {
  repositoryUrl: string
  githubUserToken: string[]
  workspaceId: string
}
