import { WorkspaceList } from '@/features/workspaceList/components/WorkspaceList'

export function WorkspacesPage() {
  // pagina principale che mostra la lista dei workspace dell'utente
  return (
    <div className="page-wrap px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Workspaces</h1>
      <WorkspaceList />
    </div>
  )
}
