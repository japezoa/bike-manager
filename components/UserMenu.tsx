'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { User, LogOut, ChevronDown, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { user, owner, role, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show login button if not authenticated
  if (!user || !owner) {
    return (
      <Link href="/login">
        <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg">
          <LogIn className="w-5 h-5" />
          <span>Iniciar Sesión</span>
        </button>
      </Link>
    );
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      mechanic: 'Mecánico',
      customer: 'Cliente'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      mechanic: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      customer: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[role as keyof typeof colors] || colors.customer;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-zinc-100">{owner.name}</p>
            <p className="text-xs text-zinc-400">{getRoleLabel(role || 'customer')}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-zinc-700">
            <p className="font-semibold text-zinc-100 mb-2">{owner.name}</p>
            <div className="space-y-1">
              <p className="text-sm text-zinc-400 break-all">{owner.email}</p>
              <p className="text-sm text-zinc-400">{owner.phone}</p>
            </div>
            <div className="mt-3">
              <span className={`inline-block px-2 py-1 text-xs font-bold rounded border ${getRoleBadgeColor(role || 'customer')}`}>
                {getRoleLabel(role || 'customer')}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 text-red-400 hover:text-red-300 transition-colors font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
