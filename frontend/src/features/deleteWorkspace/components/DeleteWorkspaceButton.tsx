import { useDeleteWorkspace } from '../hooks/useDeleteWorkspace'
import { useNavigate, useRouter } from '@tanstack/react-router'

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

type Props = {
  workspaceId: string
  workspaceName: string
}

export function DeleteWorkspaceButton({ workspaceId, workspaceName }: Props) {
  const { execute, loading } = useDeleteWorkspace()
  const router = useRouter()
  const navigate = useNavigate()

  const handleDelete = async () => {
    await execute(workspaceId)

    await router.invalidate() // 🔥 refresh cache
    navigate({ to: '/workspaces' }) // 🔥 torna alla lista
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-xs px-3 py-1.5 rounded-lg border border-red-500/40 text-red-600 hover:bg-red-500/10 transition">
          Elimina
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminare workspace?</AlertDialogTitle>

          <AlertDialogDescription>
            Il workspace <b>{workspaceName}</b> verrà eliminato definitivamente.
            Questa azione è irreversibile.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>

          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
          >
            {loading ? 'Eliminazione...' : 'Elimina'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
