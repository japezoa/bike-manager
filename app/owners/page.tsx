'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Owner } from '@/types/bicycle';
import { ownerService } from '@/lib/ownerService';
import OwnerList from '@/components/OwnerList';
import OwnerForm from '@/components/OwnerForm';
import UserMenu from '@/components/UserMenu';
import { User, Plus, ArrowLeft, List } from 'lucide-react';

type View = 'list' | 'form';

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [bicycleCounts, setBicycleCounts] = useState<Map<string, number>>(new Map());
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ownerService.getAll();
      setOwners(data);
      
      // Load bicycle counts for each owner
      const counts = new Map<string, number>();
      for (const owner of data) {
        if (owner.id) {
          const count = await ownerService.getBicyclesByOwner(owner.id);
          counts.set(owner.id, count);
        }
      }
      setBicycleCounts(counts);
    } catch (error: any) {
      console.error('Error loading owners:', error);
      setError(error.message || 'Error al cargar los propietarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOwner(null);
    setCurrentView('form');
  };

  const handleEdit = (owner: Owner) => {
    setSelectedOwner(owner);
    setCurrentView('form');
  };

  const handleDelete = async (id: string) => {
    const count = bicycleCounts.get(id) || 0;
    if (count > 0) {
      alert('No se puede eliminar un propietario que tiene bicicletas registradas. Primero elimina o reasigna las bicicletas.');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este propietario?')) return;
    
    try {
      await ownerService.delete(id);
      await loadOwners();
    } catch (error) {
      console.error('Error deleting owner:', error);
      alert('Error al eliminar el propietario');
    }
  };

  const handleSave = async () => {
    await loadOwners();
    setCurrentView('list');
    setSelectedOwner(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedOwner(null);
  };

  const handleViewBikes = (ownerId: string) => {
    // This will navigate to main page and filter by owner
    window.location.href = `/?owner=${ownerId}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-2xl shadow-lg shadow-orange-500/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-display font-black text-gradient tracking-tight">
                  PROPIETARIOS
                </h1>
                <p className="text-zinc-400 mt-1 font-semibold tracking-wide text-sm md:text-base">
                  Gestión de propietarios de bicicletas
                </p>
              </div>
            </div>

            <UserMenu />
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2 md:gap-3 mt-6">
              <Link href="/" className="flex-1 md:flex-none">
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Volver</span>
                  <span className="sm:hidden">Atrás</span>
                </button>
              </Link>
              <button
                onClick={() => setCurrentView('list')}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg font-bold transition-all duration-200 text-sm md:text-base ${
                  currentView === 'list'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <List className="w-4 h-4 md:w-5 md:h-5 md:hidden" />
                <span className="hidden md:inline">LISTA</span>
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 md:flex-none bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-3 px-4 md:px-6 rounded-lg transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">NUEVO PROPIETARIO</span>
                <span className="sm:hidden">NUEVO</span>
              </button>
            </div>
          </div>
        </header>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <main>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-zinc-400 font-semibold">Cargando propietarios...</span>
              </div>
            </div>
          ) : error ? (
            <div className="card text-center py-16">
              <div className="mb-6">
                <div className="inline-block p-4 bg-red-500/10 rounded-full mb-4">
                  <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-display font-bold text-red-400 mb-2">Error al Cargar Propietarios</h3>
                <p className="text-zinc-400 mb-6">{error}</p>
                <div className="bg-zinc-800/50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                  <h4 className="text-lg font-bold text-orange-400 mb-3">¿Qué hacer?</h4>
                  <ol className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">1.</span>
                      <span>Asegúrate de haber ejecutado la migración SQL en Supabase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">2.</span>
                      <span>Ve a Supabase → SQL Editor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">3.</span>
                      <span>Ejecuta el archivo <code className="bg-zinc-900 px-2 py-1 rounded text-cyan-400">supabase/migration-v2.sql</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">4.</span>
                      <span>Recarga esta página</span>
                    </li>
                  </ol>
                </div>
                <button
                  onClick={() => loadOwners()}
                  className="mt-6 btn-primary"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : currentView === 'list' ? (
            <OwnerList
              owners={owners}
              bicycleCounts={bicycleCounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewBikes={handleViewBikes}
            />
          ) : (
            <OwnerForm
              owner={selectedOwner}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </main>
      </div>
    </div>
  );
}
