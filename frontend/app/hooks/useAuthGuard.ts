'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects unauthenticated users to /login.
 * If requireBusiness is true, also redirects PERSONAL-mode users to /app.
 */
export function useAuthGuard(options?: { requireBusiness?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (options?.requireBusiness && user.mode !== 'BUSINESS') {
      router.replace('/app');
    }
  }, [loading, user, router, options?.requireBusiness]);
}
