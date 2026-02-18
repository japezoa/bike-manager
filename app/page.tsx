'use client';

import { useState, useEffect } from 'react';
import { Bicycle } from '@/types/bicycle';
import { bicycleService } from '@/lib/bicycleService';
import BikeList from '@/components/BikeList';
import BikeForm from '@/components/BikeForm';
import BikeComparison from '@/components/BikeComparison';
import { Bike, Plus, GitCompare } from 'lucide-react';

type View = 'list' | 'form' | 'comparison';

export default function Home() {
  const [bicycles, setBicycles] = useState<Bicycle[]>([]);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedBike, setSelectedBike] = useState<Bicycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBicycles();
  }, []);

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-cyan-500/30">
                <Bike className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-display font-black text-gradient tracking-tight">
                  BIKE MANAGER
                </h1>
                <p className="text-zinc-400 mt-1 font-semibold tracking-wide">
                  Sistema de gestión de bicicletas
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                  currentView === 'list'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                LISTA
              </button>
              <button
                onClick={() => setCurrentView('comparison')}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'comparison'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
                disabled={bicycles.length < 2}
              >
                <GitCompare className="w-5 h-5" />
                COMPARAR
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                NUEVA BICI
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-zinc-400 font-semibold">Cargando bicicletas...</span>
              </div>
            </div>
          ) : currentView === 'list' ? (
            <BikeList
              bicycles={bicycles}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          ) : currentView === 'form' ? (
            <BikeForm
              bicycle={selectedBike}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <BikeComparison bicycles={bicycles} />
          )}
        </main>
      </div>
    </div>
  );
}
