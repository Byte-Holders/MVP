import { useWorkspaces } from '../hooks/useWorkspaces'
import { WorkspaceListItem } from './WorkspaceListItem'

export function WorkspaceList() { //visualizza la lista dei workspace dell'utente, con gestione di loading, errori e caso in cui non ci sono workspace
  const { workspaces, isLoading, error } = useWorkspaces()

  if (isLoading) return <p className="text-gray-500 text-center">Loading workspaces...</p>
  if (error)     return <p className="text-red-500 text-center">{error}</p>
  if (workspaces.length === 0) {
    return <p className="text-gray-400 text-center">No workspaces yet. Create your first one!</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
    {workspaces.map(ws => (
        <WorkspaceListItem key={ws.id} workspace={ws} /> //chiamo i singoli item della lista
    ))}
    </div>
  )
}