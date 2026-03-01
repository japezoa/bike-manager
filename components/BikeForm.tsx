'use client';

import { useState, useEffect } from 'react';
import { Bicycle, MaintenanceRecord, Owner } from '@/types/bicycle';
import { bicycleService } from '@/lib/bicycleService';
import { ownerService } from '@/lib/ownerService';
import { Save, X, Upload, Plus, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from './RoleGuard';

interface BikeFormProps {
  bicycle: Bicycle | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BikeForm({ bicycle, onSave, onCancel }: BikeFormProps) {
  const { canAssignOwners } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  
  const [formData, setFormData] = useState<Omit<Bicycle, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    brand: '',
    model: '',
    bikeType: 'MTB',
    status: 'in_use',
    frame: '',
    fork: '',
    transmission: {
      speeds: '',
      shifter: '',
      chain: '',
      crankset: '',
      bottomBracket: '',
      rearDerailleur: '',
      frontDerailleur: '',
      cassette: '',
    },
    brakes: {
      type: '',
      rotorSize: '',
      model: '',
    },
    wheels: {
      frontRim: '',
      frontHub: '',
      rearRim: '',
      rearHub: '',
      tires: '',
      wheelSize: '',
    },
    components: {
      handlebar: '',
      stem: '',
      seatpost: '',
      saddle: '',
      pedals: '',
    },
    maintenanceHistory: [],
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    purchaseCondition: 'used',
    totalKilometers: 0,
    currentStatus: 'with_owner',
  });

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    if (bicycle) {
      // Sort maintenance history by date (newest first)
      const sortedBike = {
        ...bicycle,
        maintenanceHistory: [...bicycle.maintenanceHistory].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      };
      setFormData(sortedBike);
      if (bicycle.imageUrl) {
        setImagePreview(bicycle.imageUrl);
      }
    }
  }, [bicycle]);

  const loadOwners = async () => {
    try {
      const data = await ownerService.getAll();
      
      // Filter: only customers can own bikes (not admin or mechanic)
      const customersOnly = data.filter(owner => owner.role === 'customer');
      
      setOwners(customersOnly);
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMaintenance = () => {
    const newMaintenance: MaintenanceRecord = {
      date: new Date().toISOString().split('T')[0],
      description: '',
      cost: 0,
    };
    setFormData(prev => ({
      ...prev,
      maintenanceHistory: [newMaintenance, ...prev.maintenanceHistory],
    }));
  };

  const handleMaintenanceChange = (index: number, field: keyof MaintenanceRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      maintenanceHistory: prev.maintenanceHistory.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleDeleteMaintenance = (index: number) => {
    setFormData(prev => ({
      ...prev,
      maintenanceHistory: prev.maintenanceHistory.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      if (bicycle?.id) {
        // Update existing bicycle
        if (imageFile) {
          if (bicycle.imageUrl) {
            await bicycleService.deleteImage(bicycle.imageUrl);
          }
          imageUrl = await bicycleService.uploadImage(imageFile, bicycle.id);
        }
        await bicycleService.update(bicycle.id, { ...formData, imageUrl });
      } else {
        // Create new bicycle
        const newBike = await bicycleService.create(formData);
        if (imageFile && newBike.id) {
          imageUrl = await bicycleService.uploadImage(imageFile, newBike.id);
          await bicycleService.update(newBike.id, { imageUrl });
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving bicycle:', error);
      alert('Error al guardar la bicicleta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold text-gradient">
          {bicycle ? 'EDITAR BICICLETA' : 'NUEVA BICICLETA'}
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Image Upload */}
      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">FOTO</h3>
        <div className="flex flex-col items-center gap-4">
          {imagePreview && (
            <div className="w-full h-64 rounded-lg overflow-hidden bg-zinc-800">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <label className="w-full cursor-pointer">
            <div className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-zinc-700">
              <Upload className="w-5 h-5" />
              Seleccionar imagen
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Owner Information - Only Admin */}
      {canAssignOwners && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-display font-bold text-orange-400">PROPIETARIO</h3>
            </div>
            <Link href="/owners" target="_blank">
              <button
                type="button"
                className="text-sm bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-orange-500/20"
              >
                Gestionar Propietarios
              </button>
            </Link>
          </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label">Seleccionar Propietario</label>
            <select
              value={formData.ownerId || ''}
              onChange={(e) => handleInputChange('ownerId', e.target.value || undefined)}
              className="input-field"
            >
              <option value="">Sin propietario asignado</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} - {owner.rut}
                </option>
              ))}
            </select>
            {owners.length === 0 && (
              <p className="text-sm text-zinc-500 mt-2">
                No hay propietarios registrados. 
                <Link href="/owners" target="_blank" className="text-orange-400 hover:text-orange-300 ml-1">
                  Crear uno aquí
                </Link>
              </p>
            )}
          </div>
          {formData.ownerId && owners.length > 0 && (
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              {(() => {
                const selectedOwner = owners.find(o => o.id === formData.ownerId);
                if (!selectedOwner) return null;
                return (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-400">Datos del Propietario</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-zinc-500">Nombre:</span>
                        <span className="text-zinc-200 ml-2">{selectedOwner.name}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">RUT:</span>
                        <span className="text-zinc-200 ml-2">{selectedOwner.rut}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Email:</span>
                        <span className="text-zinc-200 ml-2">{selectedOwner.email}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Teléfono:</span>
                        <span className="text-zinc-200 ml-2">{selectedOwner.phone}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Basic Information */}
      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">INFORMACIÓN BÁSICA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
              placeholder="Ej: Amante 2"
            />
          </div>
          <div>
            <label className="label">Marca</label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="input-field"
              placeholder="Ej: Cannondale"
            />
          </div>
          <div>
            <label className="label">Modelo</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="input-field"
              placeholder="Ej: Catalyst 4"
            />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select
              required
              value={formData.bikeType}
              onChange={(e) => handleInputChange('bikeType', e.target.value)}
              className="input-field"
            >
              <option value="MTB">MTB</option>
              <option value="Gravel">Gravel</option>
              <option value="Ruta">Ruta</option>
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select
              required
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="input-field"
            >
              <option value="in_use">En Uso</option>
              <option value="sold">Vendida</option>
              <option value="stolen">Robada</option>
            </select>
          </div>
          <div>
            <label className="label">Cuadro</label>
            <input
              type="text"
              required
              value={formData.frame}
              onChange={(e) => handleInputChange('frame', e.target.value)}
              className="input-field"
              placeholder="Ej: SmartForm C3 Alloy"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Horquilla</label>
            <input
              type="text"
              required
              value={formData.fork}
              onChange={(e) => handleInputChange('fork', e.target.value)}
              className="input-field"
              placeholder="Ej: Suntour XCM RL DS 120mm"
            />
          </div>
        </div>
      </div>

      {/* Transmission */}
      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">TRANSMISIÓN</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Velocidades</label>
            <select
              required
              value={formData.transmission.speeds}
              onChange={(e) => handleNestedChange('transmission', 'speeds', e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar velocidades</option>
              <option value="1x10">1x10</option>
              <option value="1x11">1x11</option>
              <option value="1x12">1x12</option>
              <option value="2x10">2x10</option>
              <option value="2x11">2x11</option>
              <option value="3x7">3x7</option>
              <option value="3x8">3x8</option>
              <option value="3x9">3x9</option>
            </select>
          </div>
          <div>
            <label className="label">Shifter</label>
            <input
              type="text"
              value={formData.transmission.shifter}
              onChange={(e) => handleNestedChange('transmission', 'shifter', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano SL-M5100"
            />
          </div>
          <div>
            <label className="label">Cadena</label>
            <input
              type="text"
              value={formData.transmission.chain}
              onChange={(e) => handleNestedChange('transmission', 'chain', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano CN-HG601"
            />
          </div>
          <div>
            <label className="label">Bielas / Plato</label>
            <input
              type="text"
              value={formData.transmission.crankset}
              onChange={(e) => handleNestedChange('transmission', 'crankset', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano Deore FC-M5100-1"
            />
          </div>
          <div>
            <label className="label">Eje</label>
            <input
              type="text"
              value={formData.transmission.bottomBracket}
              onChange={(e) => handleNestedChange('transmission', 'bottomBracket', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano BB-MT501"
            />
          </div>
          <div>
            <label className="label">Cambio Trasero</label>
            <input
              type="text"
              value={formData.transmission.rearDerailleur}
              onChange={(e) => handleNestedChange('transmission', 'rearDerailleur', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano Deore RD-M5100-SGS"
            />
          </div>
          <div>
            <label className="label">Cambio Delantero (Opcional)</label>
            <input
              type="text"
              value={formData.transmission.frontDerailleur || ''}
              onChange={(e) => handleNestedChange('transmission', 'frontDerailleur', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano FD-TY700"
            />
          </div>
          <div>
            <label className="label">Piñón / Cassette</label>
            <input
              type="text"
              value={formData.transmission.cassette}
              onChange={(e) => handleNestedChange('transmission', 'cassette', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano CS-M5100-11 11-51T"
            />
          </div>
        </div>
      </div>

      {/* Brakes */}
      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">FRENOS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Tipo</label>
            <input
              type="text"
              required
              value={formData.brakes.type}
              onChange={(e) => handleNestedChange('brakes', 'type', e.target.value)}
              className="input-field"
              placeholder="Ej: Disco hidráulico"
            />
          </div>
          <div>
            <label className="label">Modelo</label>
            <input
              type="text"
              value={formData.brakes.model || ''}
              onChange={(e) => handleNestedChange('brakes', 'model', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano MT200"
            />
          </div>
          <div>
            <label className="label">Tamaño de rotor</label>
            <input
              type="text"
              value={formData.brakes.rotorSize || ''}
              onChange={(e) => handleNestedChange('brakes', 'rotorSize', e.target.value)}
              className="input-field"
              placeholder="Ej: 160mm"
            />
          </div>
        </div>
      </div>

      {/* Wheels */}
      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">RUEDAS / NEUMÁTICOS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Tamaño de rueda</label>
            <input
              type="text"
              required
              value={formData.wheels.wheelSize}
              onChange={(e) => handleNestedChange('wheels', 'wheelSize', e.target.value)}
              className="input-field"
              placeholder="Ej: 27.5'' o 29''"
            />
          </div>
          <div>
            <label className="label">Neumáticos</label>
            <input
              type="text"
              value={formData.wheels.tires}
              onChange={(e) => handleNestedChange('wheels', 'tires', e.target.value)}
              className="input-field"
              placeholder="Ej: Maxxis Crossmark II 27.5×2.1"
            />
          </div>
          <div>
            <label className="label">Llanta Delantera</label>
            <input
              type="text"
              value={formData.wheels.frontRim}
              onChange={(e) => handleNestedChange('wheels', 'frontRim', e.target.value)}
              className="input-field"
              placeholder="Ej: DC 6.0, Double Wall"
            />
          </div>
          <div>
            <label className="label">Maza Delantera</label>
            <input
              type="text"
              value={formData.wheels.frontHub}
              onChange={(e) => handleNestedChange('wheels', 'frontHub', e.target.value)}
              className="input-field"
              placeholder="Ej: Shimano TX505"
            />
          </div>
          <div>
            <label className="label">Llanta Trasera</label>
            <input
              type="text"
              value={formData.wheels.rearRim}
              onChange={(e) => handleNestedChange('wheels', 'rearRim', e.target.value)}
              className="input-field"
              placeholder="Ej: Weinmann 27.5 U28"
            />
          </div>
          <div>
            <label className="label">Maza Trasera</label>
            <input
              type="text"
              value={formData.wheels.rearHub}
              onChange={(e) => handleNestedChange('wheels', 'rearHub', e.target.value)}
              className="input-field"
              placeholder="Ej: ARC MT009 MTB"
            />
          </div>
        </div>
      </div>

      {/* Components */}
      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">COMPONENTES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Manubrio</label>
            <input
              type="text"
              value={formData.components.handlebar}
              onChange={(e) => handleNestedChange('components', 'handlebar', e.target.value)}
              className="input-field"
              placeholder="Ej: Aleación, 700mm, 31.8"
            />
          </div>
          <div>
            <label className="label">Potencia / Tee</label>
            <input
              type="text"
              value={formData.components.stem}
              onChange={(e) => handleNestedChange('components', 'stem', e.target.value)}
              className="input-field"
              placeholder="Ej: Aleación, 31.8, 8°"
            />
          </div>
          <div>
            <label className="label">Tija</label>
            <input
              type="text"
              value={formData.components.seatpost}
              onChange={(e) => handleNestedChange('components', 'seatpost', e.target.value)}
              className="input-field"
              placeholder="Ej: Aleación 27.2×350mm"
            />
          </div>
          <div>
            <label className="label">Sillín</label>
            <input
              type="text"
              value={formData.components.saddle}
              onChange={(e) => handleNestedChange('components', 'saddle', e.target.value)}
              className="input-field"
              placeholder="Ej: Cannondale Etapa 2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Pedales (Opcional)</label>
            <input
              type="text"
              value={formData.components.pedals || ''}
              onChange={(e) => handleNestedChange('components', 'pedals', e.target.value)}
              className="input-field"
              placeholder="Ej: VP VPE-891"
            />
          </div>
        </div>
      </div>

      {/* Purchase Info */}
      <div className="card">
        <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">INFORMACIÓN DE COMPRA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Fecha de compra</label>
            <input
              type="date"
              required
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Precio (CLP)</label>
            <input
              type="number"
              required
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">Condición</label>
            <select
              value={formData.purchaseCondition}
              onChange={(e) => handleInputChange('purchaseCondition', e.target.value)}
              className="input-field"
            >
              <option value="new">Nueva</option>
              <option value="used">Usada</option>
            </select>
          </div>
          <div>
            <label className="label">Kilómetros totales (Opcional)</label>
            <input
              type="number"
              value={formData.totalKilometers || 0}
              onChange={(e) => handleInputChange('totalKilometers', Number(e.target.value))}
              className="input-field"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Maintenance History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-bold text-cyan-400">HISTORIAL DE MANTENCIÓN</h3>
          <button
            type="button"
            onClick={handleAddMaintenance}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
        
        {formData.maintenanceHistory.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No hay mantenciones registradas</p>
        ) : (
          <div className="space-y-4">
            {formData.maintenanceHistory.map((maintenance, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="label text-xs">Fecha</label>
                    <input
                      type="date"
                      value={maintenance.date}
                      onChange={(e) => handleMaintenanceChange(index, 'date', e.target.value)}
                      className="input-field py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label text-xs">Descripción</label>
                    <input
                      type="text"
                      value={maintenance.description}
                      onChange={(e) => handleMaintenanceChange(index, 'description', e.target.value)}
                      className="input-field py-2"
                      placeholder="Ej: Cambio de neumáticos"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Costo (CLP)</label>
                    <input
                      type="number"
                      value={maintenance.cost || 0}
                      onChange={(e) => handleMaintenanceChange(index, 'cost', Number(e.target.value))}
                      className="input-field py-2"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">KM actual (Opcional)</label>
                    <input
                      type="number"
                      value={maintenance.kilometersAtMaintenance || ''}
                      onChange={(e) => handleMaintenanceChange(index, 'kilometersAtMaintenance', e.target.value ? Number(e.target.value) : undefined)}
                      className="input-field py-2"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="label text-xs">Próximo KM (Opcional)</label>
                      <input
                        type="number"
                        value={maintenance.nextMaintenanceKilometers || ''}
                        onChange={(e) => handleMaintenanceChange(index, 'nextMaintenanceKilometers', e.target.value ? Number(e.target.value) : undefined)}
                        className="input-field py-2"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteMaintenance(index)}
                        className="bg-red-600/10 hover:bg-red-600/20 text-red-400 p-2 rounded-lg transition-all duration-200 border border-red-600/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
