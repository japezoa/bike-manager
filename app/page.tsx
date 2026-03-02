'use client';

import { useState, useEffect } from 'react';
import { Bicycle } from '@/types/bicycle';
import { bicycleService } from '@/lib/bicycleService';
import BikeList from '@/components/BikeList';
import BikeForm from '@/components/BikeForm';
import { Bike, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import { usePermissions } from '@/components/RoleGuard';
import { useAuth } from '@/components/AuthProvider';

type View = 'list' | 'form';

export default function Home() {
  const { canCreateBikes, canViewAllOwners } = usePermissions();
  const { owner: currentUser, role } = useAuth();
  const [bicycles, setBicycles] = useState<Bicycle[]>([]);
  const [filteredBicycles, setFilteredBicycles] = useState<Bicycle[]>([]);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedBike, setSelectedBike] = useState<Bicycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>(['in_use', 'in_workshop']); // Default: show active bikes

  useEffect(() => {
    loadBicycles();
    // Check URL for owner filter
    const params = new URLSearchParams(window.location.search);
    const ownerId = params.get('owner');
    
    if (ownerId) {
      setOwnerFilter(ownerId);
    }
  }, []);

  useEffect(() => {
    // Check for edit parameter when bicycles load
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    
    if (editId && bicycles.length > 0) {
      const bikeToEdit = bicycles.find(b => b.id === editId);
      if (bikeToEdit) {
        handleEdit(bikeToEdit);
        // Clear the parameter from URL
        window.history.replaceState({}, '', '/');
      }
    }
  }, [bicycles]);

  useEffect(() => {
    // Apply filters
    let filtered = bicycles;
    
    // If customer, only show their bikes
    if (role === 'customer' && currentUser) {
      filtered = bicycles.filter(b => b.ownerId === currentUser.id);
    }
    
    // Apply manual owner filter (for admin/mechanic)
    if (ownerFilter && role !== 'customer') {
      filtered = filtered.filter(b => b.ownerId === ownerFilter);
    }
    
    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(b => statusFilter.includes(b.status));
    }
    
    setFilteredBicycles(filtered);
  }, [bicycles, ownerFilter, statusFilter, role, currentUser]);

  const loadBicycles = async () => {
    try {
      setLoading(true);
      const data = await bicycleService.getAll();
      setBicycles(data);
    } catch (error) {
      console.error('Error loading bicycles:', error);
      alert('Error al cargar las bicicletas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBike(null);
    setCurrentView('form');
  };

  const handleEdit = (bike: Bicycle) => {
    setSelectedBike(bike);
    setCurrentView('form');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta bicicleta?')) return;
    
    try {
      const bike = bicycles.find(b => b.id === id);
      if (bike?.imageUrl) {
        await bicycleService.deleteImage(bike.imageUrl);
      }
      await bicycleService.delete(id);
      await loadBicycles();
    } catch (error) {
      console.error('Error deleting bicycle:', error);
      alert('Error al eliminar la bicicleta');
    }
  };

  const handleSave = async () => {
    await loadBicycles();
    setCurrentView('list');
    setSelectedBike(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedBike(null);
  };

  const handleReorder = async (reorderedBikes: Bicycle[]) => {
    try {
      const updates = reorderedBikes.map((bike, index) => ({
        id: bike.id!,
        displayOrder: index
      }));
      
      await bicycleService.updateOrder(updates);
      setBicycles(reorderedBikes);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error al actualizar el orden');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-cyan-500/30">
                <Bike className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-display font-black text-gradient tracking-tight">
                  BIKE MANAGER
                </h1>
                <p className="text-zinc-400 mt-1 font-semibold tracking-wide text-sm md:text-base">
                  Sistema de gestión de bicicletas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserMenu />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2 md:gap-3 mt-6">
            <button
              onClick={() => setCurrentView('list')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg font-bold transition-all duration-200 text-sm md:text-base ${
                currentView === 'list'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              LISTA
            </button>
            {canViewAllOwners && (
              <Link href="/owners" className="flex-1 md:flex-none">
                <button className="w-full px-4 md:px-6 py-3 rounded-lg font-bold transition-all duration-200 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center gap-2 text-sm md:text-base">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">PROPIETARIOS</span>
                  <span className="sm:hidden">DUEÑOS</span>
                </button>
              </Link>
            )}
            {canCreateBikes && (
              <button
                onClick={handleCreate}
                className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">NUEVA BICI</span>
                <span className="sm:hidden">NUEVA</span>
              </button>
            )}
          </div>

          {/* Status Filters */}
          {currentView === 'list' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-zinc-400 text-sm font-semibold self-center">Mostrar:</span>
              {[
                { value: 'in_use', label: 'En Uso', color: 'green' },
                { value: 'in_workshop', label: 'En Taller', color: 'orange' },
                { value: 'stolen', label: 'Robada', color: 'red' },
                { value: 'sold', label: 'Vendida', color: 'blue' }
              ].map((status) => {
                const isActive = statusFilter.includes(status.value);
                return (
                  <button
                    key={status.value}
                    onClick={() => {
                      if (isActive) {
                        setStatusFilter(statusFilter.filter(s => s !== status.value));
                      } else {
                        setStatusFilter([...statusFilter, status.value]);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                      isActive
                        ? status.color === 'green' ? 'bg-green-500/20 text-green-400 border-green-500/40'
                        : status.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : status.color === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {status.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <main>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-zinc-400 font-semibold">Cargando bicicletas...</span>
              </div>
            </div>
          ) : (
            <>
              {ownerFilter && (
                <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-semibold">
                      Filtrando por propietario ({filteredBicycles.length} {filteredBicycles.length === 1 ? 'bici' : 'bicis'})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setOwnerFilter(null);
                      window.history.pushState({}, '', '/');
                    }}
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Quitar filtro
                  </button>
                </div>
              )}
              {currentView === 'list' ? (
                <BikeList
                  bicycles={filteredBicycles}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                />
              ) : (
                <BikeForm
                  bicycle={selectedBike}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
