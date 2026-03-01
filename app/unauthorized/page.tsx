'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <div className="card p-12">
          {/* Icon */}
          <div className="inline-block bg-red-500/10 p-6 rounded-full mb-6">
            <Shield className="w-16 h-16 text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-display font-black text-gradient mb-4">
            ACCESO DENEGADO
          </h1>

          {/* Message */}
          <p className="text-zinc-400 text-lg mb-2">
            No tienes permisos para acceder a esta página
          </p>
          <p className="text-zinc-500 text-sm mb-8">
            Si crees que esto es un error, contacta al administrador del taller
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/">
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Volver al inicio
              </button>
            </Link>
            
            <Link href="/login">
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                Cerrar sesión
              </button>
            </Link>
          </div>

          {/* Info */}
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <p className="text-zinc-600 text-sm">
              Roles del sistema:
            </p>
            <div className="mt-3 space-y-2 text-xs text-zinc-500">
              <div>👤 <span className="text-zinc-400">Cliente:</span> Solo ve sus bicicletas</div>
              <div>🔧 <span className="text-zinc-400">Mecánico:</span> Ve todo, edita OT</div>
              <div>👨‍💼 <span className="text-zinc-400">Admin:</span> Control total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
