'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AuthProvider from '@/components/AuthProvider';
import { ToastProvider } from '@/components/mil';
import { SocketProvider } from '@/lib/SocketContext';

export default function Providers({ children }) {
  const path = usePathname();

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        try {
          const options =
            init && typeof init === 'object' && !Array.isArray(init)
              ? { ...init, credentials: 'include' }
              : { credentials: 'include' };
          return originalFetch(input, options);
        } catch {
          return originalFetch(input, init);
        }
      }
      return originalFetch(input, init);
    };
  }, []);

  return (
    <AuthProvider>
      {path.startsWith('/operations') ? (
        children
      ) : (
        <SocketProvider>
          <ToastProvider>{children}</ToastProvider>
        </SocketProvider>
      )}
    </AuthProvider>
  );
}
