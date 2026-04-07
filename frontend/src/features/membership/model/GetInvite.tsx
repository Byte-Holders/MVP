import { fetchAuthSession } from 'aws-amplify/auth';
import type { Invite } from '../types';

export const fetchInvites = async (userId: string): Promise<Invite[]> => {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  const response = await fetch(`http://localhost:3001/membership/invites?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      //PASSA IL TOKEN QUI
      'Authorization': `Bearer ${token}` 
    },
  });

  if (response.status === 401) {
    console.error("Errore 401: Il token è mancante o scaduto.");
    return [];
  }

  if (!response.ok) throw new Error('Errore nel recupero inviti');
  
  return response.json();
};