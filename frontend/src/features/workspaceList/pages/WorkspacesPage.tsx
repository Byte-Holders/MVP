import { WorkspaceList } from '@/features/workspaceList/components/WorkspaceList'

export function WorkspacesPage() { //pagina principale che mostra la lista dei workspace dell'utente
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Workspaces</h1>
      <WorkspaceList />
    </div>
  )
}