import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getCurrentUser } from 'aws-amplify/auth';

export function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Amplify gestisce automaticamente il code exchange
        await getCurrentUser();

        // Controlla se c'era una destinazione salvata
        const redirectTo = sessionStorage.getItem('auth_redirect');
        sessionStorage.removeItem('auth_redirect');

        navigate({ to: redirectTo || '/workspaces', replace: true });
      } catch (err) {
        console.error('Callback error:', err);
        navigate({ to: '/', replace: true });
      }
    }

    handleCallback();
  }, [navigate]);

  return <div>Accesso in corso...</div>;
}