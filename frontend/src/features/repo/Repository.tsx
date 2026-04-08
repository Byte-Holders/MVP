import { ScanButton } from './components/ScanButton'

export function RepositoryPage() {
  return (
    <div>
      <div>Repository Page</div>
      <ScanButton
        repositoryId="myRepository"
        branch="myBranch"
        workspaceId="myWorkspace"
      />
    </div>
  )
}
