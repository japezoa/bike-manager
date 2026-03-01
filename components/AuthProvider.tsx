'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import { Owner } from '@/types/bicycle';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: any | null;
  owner: Owner | null;
  role: 'admin' | 'mechanic' | 'customer' | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  owner: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const PUBLIC_ROUTES = ['/login', '/auth/callback'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [role, setRole] = useState<'admin' | 'mechanic' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Listen to auth changes
    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setOwner(null);
        setRole(null);
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push('/login');
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authService.getSession();

      if (!session) {
        setUser(null);
        setOwner(null);
        setRole(null);
        
        // Redirect to login if not on public route
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push('/login');
        }
      } else {
        const currentUser = await authService.getCurrentUser();
        const ownerProfile = await authService.getOrCreateOwnerProfile();
        
        // If user exists but no owner profile, DENY ACCESS
        if (!ownerProfile) {
          // Sign out the user
          await authService.signOut();
          
          // Redirect to login with error
          router.push('/login?error=not_registered');
          setLoading(false);
          return;
        }
        
        const userRole = await authService.getUserRole();

        setUser(currentUser);
        setOwner(ownerProfile);
        setRole(userRole);

        // Redirect from login if already authenticated
        if (pathname === '/login') {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setOwner(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setOwner(null);
      setRole(null);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loader while checking auth (except on public routes)
  if (loading && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, owner, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
