'use client';

import { useAuth } from './AuthProvider';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<'admin' | 'mechanic' | 'customer'>;
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { role } = useAuth();

  // Admin always has access
  if (role === 'admin') {
    return <>{children}</>;
  }

  // Check if user's role is in allowed list
  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Hook para verificar permisos en lógica
export function usePermissions() {
  const { role } = useAuth();

  return {
    isAdmin: role === 'admin',
    isMechanic: role === 'mechanic',
    isCustomer: role === 'customer',
    isStaff: role === 'admin' || role === 'mechanic',
    
    // Permisos específicos
    canEditBikes: role === 'admin', // Solo admin puede editar bicis
    canDeleteBikes: role === 'admin',
    canEditOwners: role === 'admin',
    canDeleteOwners: role === 'admin',
    canViewAllBikes: role === 'admin' || role === 'mechanic',
    canViewAllOwners: role === 'admin' || role === 'mechanic',
    canEditMaintenances: role === 'admin' || role === 'mechanic', // Ambos pueden editar mantenciones
    canCreateBikes: role === 'admin', // Solo admin puede crear bicis
    canAssignOwners: role === 'admin', // Solo admin puede asignar propietarios
  };
}
