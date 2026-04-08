import { performManageInvite } from '../model/PerformAcceptInvite'

export const useRejectInvite = (onSuccess: () => void) => {
  const handleReject = async (userId: string, workspaceId: string) => {
    try {
      await performManageInvite(userId, workspaceId, 'Reject')
      onSuccess() // Aggiorna la lista
    } catch (err) {
      alert(err)
    }
  }
  return { handleReject }
}
