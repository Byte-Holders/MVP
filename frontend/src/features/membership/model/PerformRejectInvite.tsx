export const performManageInvite = async (userId: string, workspaceId: string, action: 'Accept' | 'Reject') => {
  const response = await fetch('http://localhost:3001/membership/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, workspaceId, action }),
  });
  if (!response.ok) throw new Error(`Errore durante l'azione: ${action}`);
};