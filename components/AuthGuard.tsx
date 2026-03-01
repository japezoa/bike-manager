'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'mechanic' | 'customer';
  allowedRoles?: Array<'admin' | 'mechanic' | 'customer'>;
}

export default function AuthGuard({ children, requiredRole, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check session
      const session = await authService.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Get user role
      const userRole = await authService.getUserRole();

      // Check role requirements
      if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(userRole as any) && userRole !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-semibold">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
