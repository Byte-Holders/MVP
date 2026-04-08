export interface RepositoryInWorkspace {
  repositoryId: string
  name: string
  ownerName: string
  branches: string[]
  dateScan?: string
  documentationScore?: number
  codeCoverage?: number
  cvss?: number
}

export interface AddRepositoryRequest {
  repositoryUrl: string
  accessToken?: string
}
