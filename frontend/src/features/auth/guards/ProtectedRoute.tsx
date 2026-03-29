import { useEffect } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuthContext } from '../AuthContext';

// Rotte accessibili senza autenticazione
const PUBLIC_ROUTES = ['/', '/callback'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, login } = useAuthContext();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isPublic = PUBLIC_ROUTES.includes(currentPath);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublic) {
      login(currentPath);
    }
  }, [isAuthenticated, isLoading, isPublic]);

  // Rotte pubbliche: sempre accessibili
  if (isPublic) return <>{children}</>;

  // Rotte protette: aspetta il check, poi mostra o blocca
  if (isLoading) return <p>Caricamento...</p>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}