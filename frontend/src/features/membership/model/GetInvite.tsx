import type { Invite } from '../types';

export const fetchInvites = async (userId: string): Promise<Invite[]> => {
  const response = await fetch(`http://localhost:3001/membership/invites?userId=${userId}`);
  if (!response.ok) throw new Error('Errore nel recupero inviti');
  return response.json();
};