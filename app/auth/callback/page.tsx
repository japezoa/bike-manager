'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get session
      const session = await authService.getSession();
      
      if (session) {
        // Create or get owner profile
        await authService.getOrCreateOwnerProfile();
        
        // Redirect to home
        router.push('/');
      } else {
        // No session, redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      router.push('/login?error=auth_failed');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 font-semibold">Completando inicio de sesión...</p>
      </div>
    </div>
  );
}
