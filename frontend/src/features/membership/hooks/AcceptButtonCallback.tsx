import { performManageInvite } from '../model/PerformAcceptInvite';

export const useAcceptInvite = (onSuccess: () => void) => {
  const handleAccept = async (userId: string, workspaceId: string) => {
    try {
      await performManageInvite(userId, workspaceId, 'Accept');
      onSuccess(); // Aggiorna la lista
    } catch (err) {
      alert(err);
    }
  };
  return { handleAccept };
};