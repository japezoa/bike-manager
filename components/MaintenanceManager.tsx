'use client';

import { useState, useEffect } from 'react';
import { Maintenance, maintenanceService } from '@/lib/maintenanceService';
import { formatShortDate } from '@/lib/dateUtils';
import { Plus, Edit, Trash2, Calendar, DollarSign, Gauge, Wrench, X, Save } from 'lucide-react';
import { usePermissions } from './RoleGuard';

interface MaintenanceManagerProps {
  bicycleId: string;
}

export default function MaintenanceManager({ bicycleId }: MaintenanceManagerProps) {
  const { canEditMaintenances, isAdmin } = usePermissions();
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Maintenance>>({
    date: new Date().toISOString().split('T')[0],
    maintenanceType: 'mano_de_obra',
    description: '',
    cost: 0,
    kilometersAtMaintenance: undefined,
    nextMaintenanceKilometers: undefined,
  });

  useEffect(() => {
    loadMaintenances();
  }, [bicycleId]);

  const loadMaintenances = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getByBicycleId(bicycleId);
      setMaintenances(data);
    } catch (error) {
      console.error('Error loading maintenances:', error);
      alert('Error al cargar mantenciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.description || !formData.date || !formData.maintenanceType) {
      alert('Fecha, tipo y descripción son obligatorios');
      return;
    }

    try {
      await maintenanceService.create({
        bicycleId,
        date: formData.date!,
        maintenanceType: formData.maintenanceType!,
        description: formData.description!,
        cost: formData.cost || 0,
        kilometersAtMaintenance: formData.kilometersAtMaintenance,
        nextMaintenanceKilometers: formData.nextMaintenanceKilometers,
      });
      
      await loadMaintenances();
      setCreating(false);
      resetForm();
    } catch (error) {
      console.error('Error creating maintenance:', error);
      alert('Error al crear mantención');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.description || !formData.date || !formData.maintenanceType) {
      alert('Fecha, tipo y descripción son obligatorios');
      return;
    }

    try {
      await maintenanceService.update(id, formData);
      await loadMaintenances();
      setEditing(null);
      resetForm();
    } catch (error) {
      console.error('Error updating maintenance:', error);
      alert('Error al actualizar mantención');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta mantención?')) return;

    try {
      await maintenanceService.delete(id);
      await loadMaintenances();
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      alert('Error al eliminar mantención');
    }
  };

  const startEdit = (maintenance: Maintenance) => {
    setFormData({
      date: maintenance.date,
      maintenanceType: maintenance.maintenanceType,
      description: maintenance.description,
      cost: maintenance.cost || 0,
      kilometersAtMaintenance: maintenance.kilometersAtMaintenance,
      nextMaintenanceKilometers: maintenance.nextMaintenanceKilometers,
    });
    setEditing(maintenance.id!);
    setCreating(false);
  };

  const startCreate = () => {
    resetForm();
    setCreating(true);
    setEditing(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      maintenanceType: 'mano_de_obra',
      description: '',
      cost: 0,
      kilometersAtMaintenance: undefined,
      nextMaintenanceKilometers: undefined,
    });
  };

  const getTypeLabel = (type: string) => {
    return type === 'repuesto' ? 'Repuesto' : 'Mano de Obra';
  };

  if (!canEditMaintenances) {
    // Customer view - read only
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-display font-bold text-cyan-400">HISTORIAL DE MANTENCIÓN</h3>
        </div>
        
        {maintenances.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No hay mantenciones registradas</p>
        ) : (
          <div className="space-y-3">
            {maintenances.map((maintenance) => (
              <div key={maintenance.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-zinc-200 font-semibold">{maintenance.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-zinc-500">{formatShortDate(maintenance.date)}</p>
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded border border-cyan-500/20">
                        {getTypeLabel(maintenance.maintenanceType)}
                      </span>
                    </div>
                  </div>
                  {maintenance.cost && maintenance.cost > 0 && (
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-sm font-bold rounded-lg border border-orange-500/20">
                      ${maintenance.cost.toLocaleString()} CLP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mechanic/Admin view - editable
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-display font-bold text-cyan-400">GESTIÓN DE MANTENCIONES</h3>
        </div>
        <button
          onClick={startCreate}
          className="btn-primary flex items-center gap-2 text-sm"
          disabled={creating || editing !== null}
        >
          <Plus className="w-4 h-4" />
          Nueva Mantención
        </button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <div className="bg-zinc-800/50 rounded-lg p-4 border-2 border-cyan-500/30 mb-4">
          <h4 className="text-lg font-bold text-cyan-400 mb-4">
            {creating ? 'Nueva Mantención' : 'Editar Mantención'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Tipo *</label>
              <select
                value={formData.maintenanceType}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceType: e.target.value as 'repuesto' | 'mano_de_obra' }))}
                className="input-field"
                required
              >
                <option value="mano_de_obra">Mano de Obra</option>
                <option value="repuesto">Repuesto</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Descripción *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field"
                rows={3}
                required
                placeholder="Describe la mantención realizada..."
              />
            </div>

            <div>
              <label className="label">Costo (CLP)</label>
              <input
                type="number"
                value={formData.cost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                className="input-field"
                min="0"
                placeholder="0"
              />
            </div>

            <div>
              <label className="label">Kilómetros actuales</label>
              <input
                type="number"
                value={formData.kilometersAtMaintenance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, kilometersAtMaintenance: e.target.value ? Number(e.target.value) : undefined }))}
                className="input-field"
                min="0"
                placeholder="Opcional"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Próxima mantención (km)</label>
              <input
                type="number"
                value={formData.nextMaintenanceKilometers || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenanceKilometers: e.target.value ? Number(e.target.value) : undefined }))}
                className="input-field"
                min="0"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => creating ? handleCreate() : handleUpdate(editing!)}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {creating ? 'Crear' : 'Guardar'}
            </button>
            <button
              onClick={cancelEdit}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Maintenance List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : maintenances.length === 0 ? (
        <p className="text-zinc-500 text-center py-8">No hay mantenciones registradas</p>
      ) : (
        <div className="space-y-3">
          {maintenances.map((maintenance) => (
            <div key={maintenance.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-zinc-200 font-semibold">{maintenance.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Calendar className="w-4 h-4" />
                      {formatShortDate(maintenance.date)}
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${
                      maintenance.maintenanceType === 'repuesto'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {getTypeLabel(maintenance.maintenanceType)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {maintenance.cost && maintenance.cost > 0 && (
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-sm font-bold rounded-lg border border-orange-500/20">
                      ${maintenance.cost.toLocaleString()} CLP
                    </span>
                  )}
                  <button
                    onClick={() => startEdit(maintenance)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                    disabled={creating || editing !== null}
                  >
                    <Edit className="w-4 h-4 text-cyan-400" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(maintenance.id!)}
                      className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
              
              {(maintenance.kilometersAtMaintenance || maintenance.nextMaintenanceKilometers) && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-700">
                  {maintenance.kilometersAtMaintenance && (
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="w-4 h-4 text-purple-400" />
                      <span className="text-zinc-400">KM actual:</span>
                      <span className="text-purple-400 font-semibold">
                        {maintenance.kilometersAtMaintenance} km
                      </span>
                    </div>
                  )}
                  {maintenance.nextMaintenanceKilometers && (
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      <span className="text-zinc-400">Próximo:</span>
                      <span className="text-cyan-400 font-semibold">
                        {maintenance.nextMaintenanceKilometers} km
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
