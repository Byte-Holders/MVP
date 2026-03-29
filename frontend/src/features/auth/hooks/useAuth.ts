import { useState, useEffect } from 'react';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { signInWithRedirect } from 'aws-amplify/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { username: string; email?: string } | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      setAuthState({
        isAuthenticated: !!session.tokens,
        isLoading: false,
        user: { username: user.username },
      });
    } catch {
      setAuthState({ isAuthenticated: false, isLoading: false, user: null });
    }
  }

  async function login(redirectTo?: string) {
    // Salva la destinazione prima del redirect OAuth
    if (redirectTo) {
      sessionStorage.setItem('auth_redirect', redirectTo);
    }
    await signInWithRedirect(); // apre la Cognito Hosted UI
  }

  async function logout() {
    await signOut();
    setAuthState({ isAuthenticated: false, isLoading: false, user: null });
  }

  return { ...authState, login, logout, checkAuth };
}